/*
    This file is responsible for sending emails to users.
    It uses nodemailer to send emails.
*/

import nodemailer from 'nodemailer';
import config from '../config.json';

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass
    }
});