#!/usr/bin/bash

#### temp+40 pour conky barometre ####

num1=$(sed -n '2p' /home/rafa/.conky/conky-draw/barometre/reptravail/curr_cond)
num2=30  ###vrai 40 si -40

ans=$(bc -l <<<"$num1+$num2")

echo $ans > /home/rafa/.conky/conky-draw/barometre/reptravail/temp1



