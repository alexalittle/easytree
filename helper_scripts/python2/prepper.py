#!/usr/bin/env python2
# -*- coding: utf-8 -*-
#
#  prepper.py
#  by Alexa Little (July 2015)
#
#	Program assumtions:
#	- Takes in file of sentences
#	- One sentence per line
#	- Punctuation should be tokenized or removed
#
#	Outputs:
#	- Folder of .json files
#	- One file per sentence
#	- Files are labeled "sent1.json, sent2.json, ... sentn.json"
#		for n sentences in input file
#	- JSON files are designed to be compatible with Easy Tree
#	- User specifies directory for output
#
#	Optional arguments:
#	- "--reverse": for languages written right-to-left
#	- "--def": include translation of each token in the JSON structure
#	- "--pos": include POS of each token in the JSON structure
#	- "--t [transfile]": where "transfile" is a parallel file with translations,
#	  includes the translation for the sentence in each file
#	- "--cut [number]": stop reading sentences past index [number]; 
#	  useful to avoid creating massive directories
#
#	Dictionary format:
#	< [ROOT TAG] >
#		<ENTRY>
#			<WORD></WORD>
#			<POS></POS>
#			<GLOSS></GLOSS>
#		</ENTRY>
#		...
#	</ [ROOT TAG] >
#
#		Notes: 
#			- Within ENTRY, the order or number of tags does not matter,
#				but the tag names do.
#			- If your dictionary does not conform to this format, but you
#			    want to use --def or --pos, you can either reformat your
#			    XML or edit the variables where indicated in the code
#
#	CAUTION:
#	- The author recommends splitting files larger than 2-3000 sentences,
#	  to avoid creating excessively large directories.
#
#	Run as:
#	prepper.py sentencesfile dirname 
#		[--reverse] [--t transfile] [--dict dictfile] [--def] [--pos]
#

# module imports
# argparse handles command line arguments
import argparse
# os allows directory (folder) creation
import os
# json allows json output
import json
# codecs accomodates utf-8
import codecs

# set up the optional argument parser
parser = argparse.ArgumentParser()
parser.add_argument("infile", help="specify a file of sentences")
parser.add_argument("dirname", help="specify a directory for the output")
parser.add_argument("--reverse", help="use for right-to-left scripts", action="store_true")
parser.add_argument("--t", help="include sentence translations")
parser.add_argument("--dict", help="define dictionary file")
parser.add_argument("--define", help="include translation for each word", action="store_true")
parser.add_argument("--pos", help="include POS for each word", action="store_true")
parser.add_argument("--cut", help="truncate file at this index", type=int)
args = parser.parse_args()

# get the command line args
# input sentences file
infile = args.infile
# directory name
dirname = args.dirname

# if you want to change the dictionary tags, you can do so below:
# the tag for an entry
entry_tag = "entry"
# the tag for the word/token
word_tag = "k_ele/keb"
# the tag for POS
pos_tag = "sense/pos"
# the tag for the translation of the word/token
def_tag = "sense/gloss"

# check for optional arguments

# --reverse
if args.reverse:
	reverse = True
else:
	reverse = False
	
# --t
if args.t:
	transfile = args.t
	haveTrans = True
else:
	haveTrans = False
	
# --dict
if args.dict:
	dictfile = args.dict
	haveDict = True
else:
	haveDict = False
	
# --def
if args.define:
	if not args.dict:
		raise SystemExit("You also need to specify a dictionary file using --dict!")
	else:
		getDef = True
else:
	getDef = False
	
# --pos
if args.pos:
	if not args.dict:
		raise SystemExit("You also need to specify a dictionary file using --dict!")
	else:
		getPOS = True
else:
	getPOS = False
	
# --cut
if args.cut:
	stopindex = args.cut
else:
	stopindex = 0
	
# define the functions

# parses a dictionary file in XML format
def getDict(dictfile):
	import xml.etree.ElementTree as ET
	tree = ET.parse(dictfile)
	root = tree.getroot()
	entries = root.findall("ENTRY")
	for entry in entries:
		try: 
			word = entry.find("WORD").text
			pos = entry.find("POS").text
			definition = entry.find("GLOSS").text
			data[word] = (definition, pos)
		except AttributeError:
			pass

# prepares a JSON structure
def prepJSON(n):
	# get a clear dictionary
	tempdict.clear()
	# get the sentence
	sent = osents[n]
	# structure the json file as a dictionary
	tempdict['name'] = 'root'
	tempdict['children'] = []
	# initialize
	index = 0
	# loop through the words and build the JSON output
	while index < len(sent):
		item = sent[index]
		output = {}
		output["name"] = item
		output["index"] = index
		if getDef == True:
			try:
				output["def"] = data[item][0]
			except KeyError:
				output["def"] = "n/a"
		else:
			output["def"] = item
		if getPOS == True:
			try:
				output["pos"] = data[item][1]
			except KeyError:
				output["pos"] = "n/a"
		if reverse == False:
			tempdict['children'].append(output)
		else:
			tempdict['children'].insert(0, output)
		index += 1

print "Preparing directory"
# make sure the directory doesn't exist yet
if not os.path.exists(dirname):
	# create the directory
	os.makedirs(dirname)

print "Reading input file"
# read in the file
# get list of sentences
osents = []
with codecs.open(infile, 'r', 'utf8') as infile:
	lines = filter(None, (line.rstrip() for line in infile))
	if stopindex == 0:
		stopindex = len(lines)
	index = 0
	while index < stopindex:
		line = lines[index]
		sent = line.split()
		osents.append(sent)
		index += 1

tsents = []
if haveTrans == True:
	print "Reading translations"
	with codecs.open(transfile, 'r', 'utf8') as transfile:
		lines = filter(None, (line.rstrip() for line in transfile))
		if not stopindex:
			stopindex = len(lines)
		index = 0
		while index < stopindex:
			tsents.append(lines[index])
			index += 1
			
data = {}
if haveDict == True:
	if getDef or getPOS:
		print "Reading dictionary"
		getDict(dictfile)
			
print "Processing output"
# create a dictionary to hold the data
tempdict = {}

n = 0
# for each sentence
while n < len(osents):
	# get copies of the original and translation sentences
	osent = " ".join(osents[n])
	if haveTrans == True:
		tsent = tsents[n]
	# prepare the JSON structure
	prepJSON(n)
	# determine filename
	filename = "./" + dirname + "/" + "sent" + str(n+1) + ".json"
	#print "Writing " + filename
	# make the actual json file
	with codecs.open(filename, 'w', 'utf-8') as jsonfile:
		jsonfile.write("##o: " + osent + "\n")
		if haveTrans == True:
			jsonfile.write("##t: " + tsent + "\n")
		json.dump(tempdict, jsonfile, ensure_ascii=False)
	n += 1

print "Finished!"
