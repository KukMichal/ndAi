import express from 'express';
import bodyParser from 'body-parser';
import fileupload from 'express-fileupload';
import path from 'node:path';
import cors from 'cors';
import WordExtractor from 'word-extractor';
import pdf from 'pdf-parse';
import officeParser from 'officeparser';
import axios from 'axios';
import { parse } from 'node-html-parser';
import request from 'request';
import { defaultTreeAdapter } from 'parse5';

import { getKeywords } from "./main.js";

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileupload());

app.post('/api/input', async (req, res) => {
    const text = req.body.text;
    const keywords = await getKeywords(text);
    res.json({keywords});
});

app.post('/api/url', async (req, res) => {
    async function processTextContent(textContent) {
        const keywords = await getKeywords(textContent);
        console.log(keywords);
        res.json({keywords});
    }

    request(req.body.url, (error, res, text) => {
        if (!error && res.statusCode === 200) {
            const document = parse(text, { defaultTreeAdapter });
            const paragraphs = document.querySelectorAll('p').slice(0,5);
            const textContent = paragraphs.map((p) => {
                console.log(p.textContent.toString());
                return p.textContent.toString(); //how to minimise the number of tokens it uses - e.g. delete unnecessary spaces
            });
            processTextContent(textContent);
        }
    });
});

app.post('/api/upload', async (req, res) => {
    console.log(req.files.upload)
    const suffix = path.extname(req.files.upload.name);
    console.log("Suffix:", suffix);

    if (suffix === ".docx" || suffix === ".docx") {
        console.log("Calling word parse");
        const extractor = new WordExtractor();
        const extracted = await extractor.extract(req.files.upload.data);
        const keywords = await getKeywords(extracted._body);
        console.log(keywords);
        res.json({keywords});
    } else if (suffix === ".pdf") {
        console.log("Calling pdf parser")
        const converted = await pdf(req.files.upload.data);
        const keywords = await getKeywords(converted.text);
        console.log(keywords);
        res.json({keywords});
    } else {
        return "Wrong format.";
    }/*else if (suffix === ".pptx" || ".xlsx" || ".odt" || ".odp" || ".ods") {
        const parsed = await officeParser.parseOfficeAsync(req.files.upload.data);
        const keywords = await getKeywords(parsed);
        console.log(keywords);
        res.json({keywords});
    }*/
});

app.listen(4000, () => {
    console.log('API listening on port 4000');
});
