# rbs-helper README

This extension allows you to create/edit RBS file.

![](preview.gif)

## Features

* Jump to RBS file for the current file
* Create a new RBS file on jumping if not found
* Copy RBS definition from prototype RBS file on creating a new RBS file
* Run `rbs-inline` command on .rb file saved

## Extension Settings

This extension contributes the following settings:

* `rbs-helper.signature-directory`: The name of the signature directory
* `rbs-helper.signature-prototype-directory`: The name of the signature prototype directory
* `rbs-helper.copy-signature-prototype-on-create`: Copy the signature prototype file on creating a new RBS file
* `rbs-helper.strip-lib-directory`: Strip `lib/` directory from the filename of signature. Useful for gem development
* `rbs-helper.rbs-inline-on-save`: Run `rbs-inline` command on save .rb files
* `rbs-helper.rbs-inline-options`: Options for `rbs-inline` command

## Release Notes

### 0.2.0

* Add a new configuration: `strip-lib-directory` to support gem development.
  It strips `lib/` directory on searching the signature file.
  (ex. `lib/foo.rb` -> `sig/handwritten/foo.rbs`)

### 0.1.0

Initial release of rbs-helper
