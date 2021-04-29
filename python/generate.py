
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


def generate_question(min_length, max_length, cutoff, markov_key, starters):
    
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
    word = starters['data'][random.randint(0, len(starters['data'])-1)]
    result = word
    while i < cutoff:

        word = advanceChain(word, end=(i > desiredLength))
        result += f' {word.strip()}'

        if word == '.':
            i = cutoff

        i += 1
    return result.replace('.?', '?').replace(' .', '.').replace(' ?', '?')
        
def generate_starters(questions, mv):
    starters = {'data': []}
    for question in questions:
        if question.split(' ')[0] in mv.keys():
            starters['data'].append(question.split(' ')[0])
    return starters


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

def get_questions(number, category=None):

    if (not path.exists(f'datasets/markov{category}.json') or not path.exists(f'datasets/markovStarters{category}.json')):
        df = pd.read_csv('./JEOPARDY_CSV.csv')
        df = df.rename(columns = {" Category":"Category"}) 
        df = df.rename(columns = {" Air Date":"Air Date"})
        df = df.rename(columns = {" Round":"Round"}) 
        df = df.rename(columns = {" Value":"Value"}) 
        df = df.rename(columns = {" Question":"Question"}) 
        df = df.rename(columns = {" Answer":"Answer"})  

        if category not in df['Category'].values:
            print(f'{category} NOT IN DATASET')
            category = ''

        if category is not None and category in df['Category'].values:
            df = df.loc[df['Category'] == category]

        mk = generate_markov_key(df['Question'].values)
        starters = generate_starters(df['Question'].values, mk)

        with open(f"datasets/markov{category}.json", "w") as outfile: 
            json.dump(mk, outfile)
        with open(f'datasets/markovStarters{category}.json', 'w') as outfile:
            json.dump(starters, outfile)
        
    else:
        with open(f'datasets/markov{category}.json') as json_file:
            mk = json.load(json_file)
        with open(f'datasets/markovStarters{category}.json') as json_file:
            starters = json.load(json_file)
    
    output = []
    for i in range(0, int(sys.argv[1])):
        output.append(generate_question(6, 12, 25, mk, starters))
    return output

if __name__ == '__main__':
    
    category = None
    if len(sys.argv) > 2:
        category = sys.argv[2]

    for question in get_questions(int(sys.argv[1]), category):
        print(f'{question}\n')
    

