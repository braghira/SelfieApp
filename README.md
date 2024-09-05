# SelfieApp
Selfie App project for Fabio Vitali's Web Tecnologies course at UniBo

## Development Rules
When starting to work on the project, follow this simple rules: 
1. Pull the changes from remote "main" branch to your "main" branch
2. If main was updated, delete your local "dev" branch, if not you can still work on this branch
3. checkout to git branch called "dev"
4. Open the terminal and type ```nvm use 20```
5.Launch the start script with ```node start_script.js```, it could take some minutes to install and/or update dependencies
6. If the script returns an error, try ```npm cache clean --force```, then restart the script
7. When the script completes, follow the instructions printed on the terminal to start the dev servers. To put it simply, you will need to launch ```npm run dev``` both in the client and server directories
8. Now you can start working on the Project!
9. After you commit, push your changes on the remote "dev" branch from your local "dev" branch to create a pull request.
