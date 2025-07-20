# Installation Guide - Footnote Backreference Synchronization Plugin

## 📋 Prerequisites

Before installing the plugin, ensure you have:

- **Obsidian** version 0.9.12 or higher
- **Community Plugins** enabled in your Obsidian settings
- **Safe mode** disabled (required for community plugins)

## 🛠️ Installation Methods

### Method 1: Community Plugins (Recommended)

This is the easiest and most reliable installation method.

#### Step 1: Enable Community Plugins
1. Open **Obsidian**
2. Go to **Settings** (gear icon in the bottom left)
3. Click **Community Plugins** in the left sidebar
4. Turn off **Safe mode** if it's enabled
5. Click **Browse** to open the community plugins browser

#### Step 2: Find and Install the Plugin
1. In the community plugins browser, search for **"Footnote Backreference Synchronization"**
2. Click on the plugin in the search results
3. Click the **Install** button
4. Wait for the installation to complete
5. Click **Enable** to activate the plugin

#### Step 3: Verify Installation
1. Go back to **Settings** → **Community Plugins**
2. You should see "Footnote Backreference Synchronization" in the list of installed plugins
3. The toggle should be **enabled** (blue)
4. Click on the plugin name to access settings

### Method 2: Manual Installation

Use this method if the plugin isn't available in the community plugins browser or if you want to install a specific version.

#### Step 1: Download the Plugin
1. Go to the [GitHub Releases page](https://github.com/rolltidehero/obsidian-footnotes-hero/releases)
2. Download the latest release ZIP file
3. Extract the ZIP file to a temporary location

#### Step 2: Install to Your Vault
1. Open your **Obsidian vault folder** in your file explorer
2. Navigate to `.obsidian/plugins/` (create the folder if it doesn't exist)
3. Create a new folder called `obsidian-footnotes`
4. Copy all files from the extracted ZIP into the `obsidian-footnotes` folder

**Folder Structure:**
```
your-vault/
├── .obsidian/
│   └── plugins/
│       └── obsidian-footnotes/
│           ├── main.js
│           ├── manifest.json
│           ├── styles.css
│           └── ... (other files)
└── ... (your notes)
```

#### Step 3: Enable the Plugin
1. Open **Obsidian**
2. Go to **Settings** → **Community Plugins**
3. Turn off **Safe mode** if it's enabled
4. You should see "Footnote Backreference Synchronization" in the list
5. Toggle the plugin **on** to enable it

### Method 3: Development Installation

For developers who want to work with the source code.

#### Step 1: Clone the Repository
```bash
git clone https://github.com/rolltidehero/obsidian-footnotes-hero.git
cd obsidian-footnotes-hero
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Build the Plugin
```bash
npm run build
```

#### Step 4: Link to Your Vault
```bash
# Create a symbolic link to your vault's plugins folder
ln -s "$(pwd)" "path/to/your/vault/.obsidian/plugins/obsidian-footnotes"
```

## 🔧 Post-Installation Setup

### Step 1: Configure Settings
1. Go to **Settings** → **Community Plugins** → **Footnote Backreference Synchronization**
2. Review and adjust the settings according to your preferences:
   - **Enable Custom Label Display**: Turn this on to activate the feature
   - **Display Style**: Choose your preferred visual style
   - **Update Delay**: Adjust for performance (300ms is recommended for most users)

### Step 2: Test the Plugin
1. Create a new note or open an existing one
2. Add some footnotes using the format `[^1]` or `[^custom]`
3. Add footnote definitions at the bottom: `[^1]: Your definition here`
4. Switch to **Reading view** to see the backreferences
5. Verify that backreferences show your custom labels instead of generic icons

### Step 3: Set Up Keyboard Shortcuts (Optional)
1. Go to **Settings** → **Hotkeys**
2. Search for "Footnote"
3. Set your preferred hotkey for footnote operations
4. Default is `Ctrl+Shift+6` (or `Cmd+Shift+6` on Mac)

## 🐛 Troubleshooting

### Plugin Not Appearing in Community Plugins
**Symptoms:** Plugin doesn't show up in the community plugins browser

**Solutions:**
1. ✅ Check your internet connection
2. ✅ Restart Obsidian
3. ✅ Clear the community plugins cache:
   - Go to **Settings** → **Community Plugins**
   - Click the **Refresh** button
4. ✅ Try manual installation instead

### Plugin Installed But Not Working
**Symptoms:** Plugin is enabled but backreferences don't change

**Solutions:**
1. ✅ Check that "Enable Custom Label Display" is enabled in settings
2. ✅ Verify you're in **Reading view** (not editing mode)
3. ✅ Ensure your footnotes follow the correct format: `[^label]`
4. ✅ Check the browser console for errors (Ctrl+Shift+I)
5. ✅ Try refreshing the document (Ctrl+R)

### Performance Issues
**Symptoms:** Obsidian becomes slow or unresponsive

**Solutions:**
1. ⚡ Increase the "Update Delay" setting to 500-700ms
2. ⚡ Disable hover effects in settings
3. ⚡ Close unnecessary documents
4. ⚡ Restart Obsidian
5. ⚡ Check if other plugins are causing conflicts

### Custom Labels Not Displaying
**Symptoms:** Custom labels like `[^video]` don't show properly

**Solutions:**
1. 🔍 Ensure the label matches exactly between reference and definition
2. 🔍 Check that the definition exists at the bottom of the document
3. 🔍 Verify the format: `[^label]: definition`
4. 🔍 Try using simpler labels without special characters
5. 🔍 Check the console for parsing errors

### Plugin Conflicts
**Symptoms:** Other footnote-related plugins stop working

**Solutions:**
1. 🔧 Disable other footnote plugins temporarily
2. 🔧 Check plugin compatibility in the settings
3. 🔧 Update all plugins to their latest versions
4. 🔧 Report conflicts to the plugin developers

## 📱 Platform-Specific Instructions

### Windows
- **File Path**: `C:\Users\YourUsername\YourVault\.obsidian\plugins\obsidian-footnotes\`
- **Hotkey**: `Ctrl+Shift+6`
- **Console**: Press `F12` or `Ctrl+Shift+I`

### macOS
- **File Path**: `/Users/YourUsername/YourVault/.obsidian/plugins/obsidian-footnotes/`
- **Hotkey**: `Cmd+Shift+6`
- **Console**: Press `Cmd+Option+I`

### Linux
- **File Path**: `/home/YourUsername/YourVault/.obsidian/plugins/obsidian-footnotes/`
- **Hotkey**: `Ctrl+Shift+6`
- **Console**: Press `F12` or `Ctrl+Shift+I`

## 🔄 Updating the Plugin

### Community Plugins Method
1. Go to **Settings** → **Community Plugins**
2. Look for an **Update** button next to the plugin
3. Click **Update** to install the latest version
4. Restart Obsidian if prompted

### Manual Update
1. Download the latest release from GitHub
2. Replace the existing plugin files with the new ones
3. Restart Obsidian
4. Check that the plugin is still enabled

### Development Update
```bash
cd obsidian-footnotes-hero
git pull
npm install
npm run build
```

## 🗑️ Uninstalling the Plugin

### Community Plugins Method
1. Go to **Settings** → **Community Plugins**
2. Find "Footnote Backreference Synchronization"
3. Toggle the plugin **off**
4. Click **Uninstall** to remove it completely

### Manual Uninstall
1. Navigate to your vault's plugins folder
2. Delete the `obsidian-footnotes` folder
3. Restart Obsidian

## 📞 Getting Help

If you encounter issues during installation:

1. **📖 Check the Documentation**: Review this guide and the [User Guide](USER_GUIDE.md)
2. **🔍 Search Existing Issues**: Check [GitHub Issues](https://github.com/rolltidehero/obsidian-footnotes-hero/issues)
3. **💬 Ask the Community**: Post in [GitHub Discussions](https://github.com/rolltidehero/obsidian-footnotes-hero/discussions)
4. **🐛 Report Bugs**: Create a new issue with detailed information about your setup

### Information to Include When Reporting Issues
- **Obsidian Version**: Check in Settings → About
- **Plugin Version**: Check in Settings → Community Plugins
- **Operating System**: Windows/macOS/Linux version
- **Error Messages**: Copy from the console (Ctrl+Shift+I)
- **Steps to Reproduce**: Detailed steps to recreate the issue
- **Expected vs Actual Behavior**: What you expected vs what happened

---

**Need more help?** Check out our [User Guide](USER_GUIDE.md) for detailed usage instructions and examples. 