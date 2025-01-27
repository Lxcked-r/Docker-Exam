import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import File from '../models/files.mjs';
import logger from '../utils/logger.mjs';
import { createFile } from '../controllers/files.mjs';

const callerName = 'FileController';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadHandler = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.file;
        if (file.size > MAX_FILE_SIZE) {
            return res.status(400).send('File is too large.');
        }

        const fileName = `${uuidv4()}-${file.name}`;
        const uploadPath = resolve('uploads', fileName);

        const writeStream = createWriteStream(uploadPath);
        let uploadedBytes = 0;

        file.data.on('data', (chunk) => {
            uploadedBytes += chunk.length;
            if (uploadedBytes > MAX_FILE_SIZE) {
                file.data.destroy();
                writeStream.destroy();
                logger.warn(`${callerName}: File is too large - ${fileName}`);
                return res.status(400).send('File is too large.');
            }
        });

        file.data.pipe(writeStream);

        writeStream.on('finish', async () => {
            const newFile = await File.create({
                name: file.name,
                path: uploadPath,
                size: file.size,
                type: file.mimetype,
            });

            await createFile({
                file: newFile,
                name: file.name,
            });

            logger.info(`${callerName}: File uploaded successfully - ${fileName}`);
            res.status(200).send('File uploaded successfully.');
        });

        writeStream.on('error', (err) => {
            logger.error(`${callerName}: Error uploading file - ${err.message}`);
            res.status(500).send('Error uploading file.');
        });
    } catch (err) {
        logger.error(`${callerName}: ${err.message}`);
        res.status(500).send('Server error.');
    }
};

export default uploadHandler;