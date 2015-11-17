#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  makejson.py
#  by Alexa Little (July 2015)
#
#	Program assumtions:
#	- Takes in file of POS-tagged sentences
#	- Sentences must be delimited with one '#' on each end.
#	- example:
#		#
#		I	pron
#		am	verb
#		a	det
#		cat	noun
#		.	punct
#		#
#
#	Outputs:
#	- Folder of .json files
#	- One file per sentence
#	- Files are labeled "sent1.json, sent2.json, ... sentn.json"
#		for n sentences in input file
#	- JSON files are designed to be compatible with Easy Tree
#
#	Note:
#	- Optional command line argument "reverse", for languages written
#	  right-to-left
#
#	Run as:
#	python makejson.py sentencesfile dirname [reverse]
#

# sys allows command line arguments
import sys
# os allows directory (folder) creation
import os
# json allows json output
import json
# codecs accomodates utf-8
import codecs

# get the command line args
# input sentences file
infile = sys.argv[1]
# directory name
dirname = sys.argv[2]
# check for 'reverse'
try:
	reverse = sys.argv[3]
	if reverse == "reverse":
		reverse = True
	else:
		print reverse + " is not a valid command."
		quit()
except IndexError:
	reverse = False

print "Creating output directory"
# make sure the directory doesn't exist yet
if not os.path.exists(dirname):
	# create the directory
	os.makedirs(dirname)

print "Reading input file"
# read in the file
# get list of sentences
sents = []
with codecs.open(infile, 'r', 'utf8') as infile:
	lines = filter(None, (line.rstrip() for line in infile))
	sent = []
	# a switch variable to catch sentence delimiters
	switch = True
	for line in lines:
		if line[0] == "#" and switch == True:
			switch = False
		elif line[0] == "#" and switch == False:
			switch = True
			sents.append(sent)
			sent = []
		else:
			sent.append(line)

# create a dictionary to hold the data
tempdict = {}

n = 1
# for each sentence
for sent in sents:
	# get a clear dictionary
	tempdict.clear()
	# structure the json file as a dictionary
	tempdict['name'] = 'root'
	tempdict['children'] = []
	index = 0
	for item in sent:
		item = item.split()
		word = item[0]
		pos = item[1]
		if reverse == False:
			tempdict['children'].append({"name": word, "pos": pos, "index": index})
		else:
			tempdict['children'].insert(0, {"name": word, "pos": pos, "index": index})
		index += 1
	# determine filename
	filename = "./" + dirname + "/" + "sent" + str(n) + ".json"
	print "Writing " + filename
	# make the actual json file
	with codecs.open(filename, 'w', 'utf-8') as jsonfile:
		json.dump(tempdict, jsonfile, ensure_ascii=False)
	n += 1

print "Finished!"
