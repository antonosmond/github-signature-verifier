output "lambda_function_arn" {
  value = "${aws_lambda_function.github_signature_verifier.arn}"
}

output "lambda_function_name" {
  value = "${aws_lambda_function.github_signature_verifier.id}"
}
