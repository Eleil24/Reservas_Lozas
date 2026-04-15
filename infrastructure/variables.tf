variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-2"
}

variable "stage" {
  description = "Entorno (dev, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "football-reservations"
}

variable "db_username" {
  description = "Usuario admin de PostgreSQL"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Contraseña de PostgreSQL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret para firmar los JWT"
  type        = string
  sensitive   = true
}
