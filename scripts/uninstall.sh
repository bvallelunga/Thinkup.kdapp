#!/usr/bin/env bash

# Setup
USER=$1
OUT=$2
rm -rf $OUT/*
mkdir -p $OUT

# Start Coding Here...
touch $OUT/"50-Removing Thinkup"
rm -rf /home/$USER/Web/thinkup