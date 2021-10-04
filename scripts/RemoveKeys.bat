@echo off
(
echo module.exports = {
echo     firebase: {
echo         apiKey: 'REPLACE_ME',
echo         authDomain: 'REPLACE_ME',
echo         projectId: 'REPLACE_ME',
echo         storageBucket: 'REPLACE_ME',
echo         messagingSenderId: 'REPLACE_ME',
echo         appId: 'REPLACE_ME',
echo         measurementId: 'REPLACE_ME',
echo     },
echo };
) > %~dp0../src/renderer/keys.js