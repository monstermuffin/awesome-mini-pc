# Awesome Mini PC - This project is very much a work in progress.
This repository contains the data and code for [Awesome Mini PC](https://awesomeminipc.com), an attempt to catalog all the mini PCs, SBCs and egnerally useful homelab/self-hosting machines.

## Why?
I am so fucking fed up of having to search the entire fucking internet just to find out what fucking network controller a manufacturer have used in their own fucking machine. 

Most of the time I end up having to scour Reddit to find this information from people that already have the machine. So, there has to be a better way I keep telling myself, so here we are.

## How?
Data on machines is stored in the `data/machines` directory. Each machine is stored in a YAML file with appropriate metadata describing the machine.

This data is then generated into json for the frontend, built using TypeScript which shows this data in the form of a table on [Awesome Mini PC](https://awesomeminipc.com). This is all done on Github. 

My goal is to make this as easy as possible for people to contribute to, using Github's issue templates to allow you to fill out the information and have Github automatically create a PR to add the information to the database after being reviewed.

The end goal will be to have a definitive list of all the machines that are worth considering for a home lab or self-hoster.

## Contributing

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for details.

