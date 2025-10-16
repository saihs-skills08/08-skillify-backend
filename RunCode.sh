#!/bin/bash

lang=$1
file=$2
if [ $lang == "java" ]
then
    java ${file}
elif [ $lang == "kotlin" ]
then
    kotlinc $file -include-runtime -d ${file%.*}.jar
    java -jar ${file%.*}.jar
else 
    echo "Unsupported language"
fi
