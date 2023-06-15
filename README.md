# rbs-helper README

This extension allows you to create/edit RBS file.

![](preview.gif)

## Features

* Jump to RBS file for the current file
* Create a new RBS file on jumping if not found
* Copy RBS definition from prototype RBS file on creating a new RBS file

## Extension Settings

This extension contributes the following settings:

* `rbs-helper.signature-directory`: The name of the signature directory
* `rbs-helper.signature-prototype-directory`: The name of the signature prototype directory
* `rbs-helper.copy-signature-prototype-on-create`: Copy the signature prototype file on creating a new RBS file
* `rbs-helper.strip-lib-directory`: Strip `lib/` directory from the filename of signature. Useful for gem development

## Release Notes

### 1.0.0

Initial release of rbs-helper
