
import random
import pandas as pd
import json
import os.path
from os import path
import sys

def remove_quotes(word):
    l = ['"', "'", ',']
    for ll in l:
        word = word.replace(ll, '')
    return word

def replace_punc(word):
    
    l = ['.', '!', '?']
    for ll in l:
        word = word.replace(ll, f' {ll} ')
    return word


def generate_question(min_length, max_length, cutoff, markov_key):
    
    def advanceChain(word, end=False):

        if (end and '.' in markov_key[word]) or (end and '?' in markov_key[word]) or len(markov_key[word]) == 0:
            if '?' in markov_key[word]:
                return '?'
            else:
                return '.'
        else:
            if end:
                index = random.randint(0, len(markov_key[word])-1)
                return markov_key[word][index]
            else:
                index = random.randint(0, len(markov_key[word])-1)
                # if ('.' in markov_key[word] and len(markov_key[word]) > 1):
                    # while markov_key[word][index] == '.':
                    #     index = random.randint(0, len(markov_key[word])-1)
                return markov_key[word][index]
                    
            

    min = min_length
    max = max_length
    desiredLength = random.randint(min, max)

    i = 0
    words = [str(x) for x in markov_key.keys()]
    word = words[random.randint(0, len(words)-1)]
    result = word
    while i < cutoff:

        word = advanceChain(word, end=(i > desiredLength))
        result += f' {word.strip()}'

        if word == '.':
            i = cutoff

        i += 1
    return result
        
def generate_markov_key(questions):
    markov_key = {}

    for question in questions:
        
        question = f'{question}.'
        question = replace_punc(question)
        question = remove_quotes(question)
        words = question.split(' ')
        
        if '<a>' not in question and 'href' not in question and '<a' not in question and 'a>' not in question:
            for index, word in enumerate(words):

                word = word.strip()

                if index != len(words)-1 and word != '':
                    next_word = words[index+1].strip()
                    if word in markov_key.keys() and next_word != '':
    #                     if next_word not in markov_key[word]:
                        markov_key[word].append(next_word)
                    elif word not in markov_key.keys() and next_word != '':
                        markov_key[word] = [next_word]
                    else:
                        markov_key[word] = []
                elif word not in markov_key.keys() and word != '':
                    markov_key[word] = []
    return markov_key

if __name__ == '__main__':
    
    # if (not path.exists('markov.json')):
    df = pd.read_csv('./JEOPARDY_CSV.csv')
    df = df.rename(columns = {" Category":"Category"}) 
    df = df.rename(columns = {" Air Date":"Air Date"})
    df = df.rename(columns = {" Round":"Round"}) 
    df = df.rename(columns = {" Value":"Value"}) 
    df = df.rename(columns = {" Question":"Question"}) 
    df = df.rename(columns = {" Answer":"Answer"})  
    mk = generate_markov_key(df['Question'].values)

    # with open("markov.json", "w") as outfile: 
    #     json.dump(mk, outfile)
    # else:
    #     with open('markov.json') as json_file:
    #         mk = json.load(json_file)

    starters = {'starters': []}
    for question in df['Question'].values:
        if question.split(' ')[0] in mk.keys():
            starters['starters'].append(question.split(' ')[0])

    with open('markovStarters.json', 'w') as outfile:
        json.dump(starters, outfile)

    # for i in range(0, int(sys.argv[1])):
    #     print(generate_question(6, 12, 25, mk).replace(' .', '.').replace(' ?', '?').replace('?.', '?'))  
        # print(i) 
    # print('hello wolrd')
