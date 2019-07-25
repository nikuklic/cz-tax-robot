# Usage

To use the Tax Robot you can choose between:
- using a hosted version at https://mdcp-tax-robot.azurewebsites.net/
- self-hosting it on your own machine

## Self-hosting the Tax Robot

To self host the Tax Robot on your own machine run the following commands in your terminal
```
git clone https://garage-06.visualstudio.com/Tax%20Robot%201857%2083751/_git/Tax%20Robot%201857%2083751 mdcp-tax-robot
cd mdcp-tax-robot
npm i
npm start
```

# Known issues/limitations

- Selling of stocks scenario is not implemented yet, we would need to know your full vesting schedule and how many stocks you already sold in order to determine what needs to be taxed and what portion is tax-free
- It would be nice to have PDF anonymization tool that would randomize numbers in the stocks report so that users can easily report bugs
- Nothing is stored to disk/db while generating the report, but the report will get evicted from the server memory after 10 minutes and users will have to regenerate the report
- reports from pre-2015 do not parse correctly
