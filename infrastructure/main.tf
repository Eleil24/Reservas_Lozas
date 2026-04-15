# 1. Obtener la Red por defecto de AWS (VPC) para alojar la BD sin sobrecostos
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# 2. Grupo de seguridad para permitir conexión a la Base de Datos
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-${var.stage}-db-sg"
  description = "Permitir trafico a PostgreSQL"
  vpc_id      = data.aws_vpc.default.id

  # Permitir conexiones en el puerto 5432 (Postgres)
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # NOTA: En producción, esto debería estar restringido a tu IP o VPC
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. La Base de Datos PostgreSQL (Capa Gratuita / Barata)
resource "aws_db_instance" "postgres" {
  identifier           = "${var.project_name}-${var.stage}-db"
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp2"
  db_name              = "footballreservations"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  publicly_accessible  = true # Permite conectarte desde tu local (DBeaver/PgAdmin)
  
  vpc_security_group_ids = [aws_security_group.db_sg.id]
}

# 4. Guardar la URL en Parameter Store (SSM) para que Serverless pueda leerla
resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project_name}/${var.stage}/database-url"
  type  = "SecureString"
  value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}?schema=public"
}

# 5. Guarda el Secret JWT para Lambda
resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/${var.stage}/jwt-secret"
  type  = "SecureString"
  value = var.jwt_secret
}
