# Known issues/limitations

- Selling of stocks scenario is not implemented yet, we would need to know your full vesting schedule and how many stocks you already sold in order to determine what needs to be taxed and what portion is tax-free
- It would be nice to have PDF anonymization tool that would randomize numbers in the stocks report so that users can easily report bugs
- Nothing is stored to disk/db while generating the report, but the report will get evicted from the server memory after 10 minutes and users will have to regenerate the report
- reports from pre-2015 do not parse correctly