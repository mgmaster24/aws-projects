# Lulo Plugins

### Used to extend CloudFormation by creating Custom CloudFormation Resources via the aws-sdk-js

---

**General Usage**

If the need arises for the use of a custom CloudFormation resource, create the resource using one of the currently-available lulo plugins. If a lulo plugin doesn't exist, please refer to the Plugin Development section.

When using a lulo plugin within you **MUST**, set the `Type` to `Custom::{NameOfPluginHere}`, where the name is the plugin for the specific resource you wish to create. Each lulo plugin **MUST** also specify a `ServiceToken` which points to the lambda function running the lulo plugins. The properties for each Resource are modeled on the parameters the [Javascript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html) function associated with the resource takes.

---

**Testing Changes During Development**

In order to test changes to existing lulo plugins or to test a new lulo plugin, you need to bundle the scripts and ship it off to AWS Lambda.

1. Create your own `answers.json` file with appropriate values
2. Run `npm run-script package:custom-resources` to create an `custom-resources.zip` file
3. Upload the `custom-resources.zip` file to the S3 bucket path in your `answers.json` file
4. Run the `em-tap-ui-discovery.template.yaml` CFN deploy template

**Current Plugins**

- Route53RecordSetAPIGatewayRegionalDomain

---

**Plugin Development**

- TODO: Make more extron-specific plugin development documentation

For now, follow the advice by the creator of lulo: [writing plugins](https://carlnordenfelt.github.io/lulo/writing-plugins.html)

---

More information can be found in the **[lulo documentation](https://carlnordenfelt.github.io/lulo/)**.
