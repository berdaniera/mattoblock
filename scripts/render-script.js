// This script:
// node render-script.js {vault_filename}
const args = process.argv;
const fs = require('fs');
const puppeteer = require('puppeteer');
const db = require('better-sqlite3')('../api/token.db');
const baseurl = 'https://someurl.com';
//if(args.length < 4) throw "Insufficient parameters, try 'node render-script.js {filename}'"

db.exec(`CREATE TABLE IF NOT EXISTS metadata (id INTEGER PRIMARY KEY, name TEXT, description TEXT);`);

(async () => {
    // check if file exists in directory -- if not, return error
    if(!fs.existsSync(`../vault/${args[2]}`)){
        // you gotta get out of there
        throw `Script file ${args[2]} does not exist in local directory`
    }
    // copy script filename.js from /vault to /public/render_scripts fs.copyFile()
    fs.copyFileSync(`../vault/${args[2]}`, `../api/public/render_scripts/${args[2]}`)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1000,
        height: 1000
    });
    // connect to the api/render endpoint from /public/render_scripts/filename.js
    await page.goto(`${baseurl}/render/${args[2]}`);
    await page.waitForTimeout(3000);
    // collect metadata from the file (in the main directory)
    // alternatively, put these in as parameters and run it first
    let metadata = await page.evaluate(() => {
        return fileMetadata;
    });
    // console.log(metadata);
    // add metadata to database table -- return the tokenId
    const stmt = db.prepare(`INSERT INTO metadata (name, description) VALUES (?,?)`);
    const tokenId = stmt.run([metadata.name, metadata.description]).lastInsertRowid;
    // capture screenshot, save tokenId.png in public/image/
    await page.screenshot({ path: `../api/public/image/${tokenId}.png` });
    // rename and move the script to the tokenId.js in public/js/
    fs.renameSync('../api/public/render_scripts/'+args[2], `../api/public/js/${tokenId}.js`)
    await db.close();
    await browser.close();
})();
