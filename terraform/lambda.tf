data "archive_file" "github_signature_verifier" {
  type        = "zip"
  source_file = "${path.module}/../src/index.js"
  output_path = "${path.module}/.terraform/archives/github-signature-verifier.zip"
}

resource "aws_lambda_function" "github_signature_verifier" {
  filename         = "${data.archive_file.github_signature_verifier.output_path}"
  function_name    = "github-signature-verifier"
  handler          = "index.handler"
  role             = "${aws_iam_role.github_signature_verifier.arn}"
  description      = "Verify signatures on requests sent from GitHub Webhooks"
  memory_size      = "128"
  runtime          = "nodejs4.3"
  timeout          = "30"
  source_code_hash = "${data.archive_file.github_signature_verifier.output_base64sha256}"
}
