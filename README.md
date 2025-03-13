# Usage

To use the Tax Robot you can choose between:
- using a hosted version at https://tax-robot.azurewebsites.net/
- self-hosting it on your own machine

## Self-hosting the Tax Robot

To self host the Tax Robot on your own machine run the following commands in your terminal
```
git clone https://github.com/nikuklic/cz-tax-robot.git mdcp-tax-robot
cd mdcp-tax-robot
yarn install
yarn start
```

# Known issues/limitations

- Selling of stocks scenario is not implemented yet, we would need to know your full vesting schedule and how many stocks you already sold in order to determine what needs to be taxed and what portion is tax-free
- It would be nice to have PDF anonymization tool that would randomize numbers in the stocks report so that users can easily report bugs
- Nothing is stored to disk/db while generating the report, but the report will get evicted from the server memory after 10 minutes and users will have to regenerate the report
- Reports from pre-2015 do not parse correctly
