terraform = {
  required_version = "~> 0.9"

  backend "s3" {
    region     = "eu-west-1"
    bucket     = "ctm-terraform-state"
    key        = "github-signature-verifier/terraform.tfstate"
    encrypt    = "true"
    kms_key_id = "arn:aws:kms:eu-west-1:482506117024:alias/terraform"
    acl        = "bucket-owner-full-control"
  }
}
