# rbs-helper README

This extension allows you to create/edit RBS file.

![](preview.gif)

## Features

* Jump to RBS file for the current file
* Create a new RBS file on jumping if not found
* Copy RBS definition from prototype RBS file on creating a new RBS file
* Run `rbs-inline` command on a .rb file saved

## Extension Settings

This extension contributes the following settings:

* `rbs-helper.signature-directory`: The name of the signature directory
* `rbs-helper.signature-prototype-directory`: The name of the signature prototype directory
* `rbs-helper.copy-signature-prototype-on-create`: Copy the signature prototype file on creating a new RBS file
* `rbs-helper.strip-lib-directory`: Strip `lib/` directory from the filename of signature. Useful for gem development
* `rbs-helper.rbs-inline-on-save`: Run `rbs-inline` command on a .rb file saved
* `rbs-helper.rbs-inline-options`: Options for `rbs-inline` command (excluding --output option)
* `rbs-helper.rbs-inline-exclude_paths`: Exclude paths for rbs-inline (Comma separated, globbing not supported)
* `rbs-helper.rbs-inline-signature-directory`: The name of the signature directory for rbs-inline

## Release Notes

### 1.2.1

* Remove `--output` option from the default value of `rbs-inline-options`

### 1.2.0

* Add a new configuration: `rbs-inline-exclude_paths` to exclude paths for rbs-inline
* Add a new configuration: `rbs-inline-signature-directory` to specify the signature directory for rbs-inline
    * `--output` option is no longer needed in `rbs-inline-options`
* Delete RBS files correspond to the deleted files on Ruby files deleted
* Rename RBS files correspond to the renamed files on Ruby files renamed

### 1.1.0

* Set default setting `--opt-out --output`  to `rbs-helper.rbs-inline-options`

### 1.0.0

* Run `rbs-inline` command on a .rb file saved if enabled.

### 0.2.0

* Add a new configuration: `strip-lib-directory` to support gem development.
  It strips `lib/` directory on searching the signature file.
  (ex. `lib/foo.rb` -> `sig/handwritten/foo.rbs`)

### 0.1.0

Initial release of rbs-helper
