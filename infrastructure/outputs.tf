output "db_endpoint" {
  description = "El Endpoint de la base de datos (host:puerto)"
  value       = aws_db_instance.postgres.endpoint
}

output "ssm_database_url_parameter" {
  description = "Ruta en SSM para la URL de la BD"
  value       = aws_ssm_parameter.database_url.name
}
