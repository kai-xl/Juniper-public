# Development Configuration

This file (`dev-config.json`) allows you to easily toggle development settings without modifying code.

## Configuration Options

### `skipStartupScreens` (boolean)
- **`true`**: Skip splash, login, and startup screens - go directly to main app
- **`false`**: Use normal startup flow (splash → login → startup → main app)

### `showDevTools` (boolean)  
- **`true`**: Automatically open Chrome DevTools when main window loads
- **`false`**: Keep DevTools closed (can still open manually with F12)

### `defaultPage` (string)
- **`"home"`**: Default page (halftone animation + scan samples)
- **`"tags"`**: Tags page (for testing tag functionality)
- **`"settings"`**: Settings page
- **`"profile"`**: Profile page

## Quick Settings

### For Development (skip everything)
```json
{
  "skipStartupScreens": true,
  "showDevTools": true,
  "defaultPage": "tags"
}
```

### For Normal Use
```json
{
  "skipStartupScreens": false,
  "showDevTools": false,
  "defaultPage": "home"
}
```

### Testing Specific Pages
```json
{
  "skipStartupScreens": true,
  "showDevTools": false,
  "defaultPage": "tags"
}
```

## Usage

1. Edit `dev-config.json` in the MAIN folder
2. Restart the Electron app
3. Changes take effect immediately

The file is ignored by git so your development settings won't affect others.