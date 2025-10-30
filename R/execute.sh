#!/bin/bash

# Request sudo password upfront
echo "Please enter your password for shutdown authorization:"
sudo -v

# Keep sudo alive during R script execution
while true; do sudo -n true; sleep 50; kill -0 "$" || exit; done 2>/dev/null &

Rscript optimized_v2.R

sudo shutdown -h now
