# Development Rules
This should be the flow of work for our repository:
1. Always pull the changes from the remote origin: git@github.com:braghira/SelfieApp.git.
2. Checkout to a new git branch.
3. Open the terminal and type ```nvm use 20```.
4. Launch the start script with ```node start_script.js```, it could take some minutes to install and/or update dependencies
5. If the script returns an error, try ```npm cache clean --force```, then restart the script
6. When the script completes, follow the instructions printed on the terminal to start the dev servers. To put it simply, you will need to launch ```npm run dev``` both in the client and server directories.
7. Now you can start working on the Project.
8. After you commit, push your changes to a new remote branch from your local branch to create a pull request.
