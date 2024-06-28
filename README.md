# Plugin Config Page Documentation

## Dev Notes

This vue application is used for [auto-assign-plugin](https://github.com/aulyaAQI/auto-assign-plugin)
To modify the plugin config page, you need to:

1. Build the config.js file. On this root:

   ```
   npm run build
   ```

2. Copy the config.js to your plugin directory.
3. Rebuild the plugin (please refer to auto-assign-plugin docs).

## Overview

The Plugin Config Page is a crucial component of the Auto Assign Plugin. It allows users to configure various settings and parameters for the plugin's functionality. This document provides specifications for the Plugin Config Page, including its layout, features, and usage instructions.

## Purpose

The purpose of this document is to outline the requirements and functionality of the Auto Assign Plugin Config Page.

## Scope

The scope of this document includes the design, layout, and features of the Auto Assign Plugin Config Page.

## Features

1. Rules Configuration: Users should be able to define the rules dynamically.
2. Reorder priority list to define priority order.
3. Save Configuration: Users should be able to save the rules configuration for future use.

## User Interface

The user interface of the Auto Assign Plugin Config Page should be intuitive and user-friendly. It should include clear instructions and error messages to guide the user through the defining rules.

## Constraints

- The first priority will be defined by the threshold field. It cannot be reordered or removed.
- No duplicate components are allowed.
- The rules configuration should be saved in a persistent storage.

## Dependencies

- The Auto Assign Plugin Config Page depends on the kintone plugin development framework.
