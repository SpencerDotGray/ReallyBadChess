
import random
import pandas as pd
import json
import os.path
from os import path
import sys
import multiprocessing

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
    if len(starters['data']) > 0:
        word = starters['data'][random.randint(0, len(starters['data'])-1)]
    else:   
        words = list(markov_key.keys())
        try:
            if len(words) > 1:
                word = words[random.randint(0, len(words)-1)]
            else:
                word = words[0]
        except IndexError as e:
            print(markov_key, starters)
            raise e
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

def get_questions(df, number, category=None):

    # if (not path.exists(f'/resources/markov{category}.json') or not path.exists(f'/resources/markovStarters{category}.json')):
    #     df = pd.read_csv('./JEOPARDY_CSV.csv')
    #     df = df.rename(columns = {" Category":"Category"}) 
    #     df = df.rename(columns = {" Air Date":"Air Date"})
    #     df = df.rename(columns = {" Round":"Round"}) 
    #     df = df.rename(columns = {" Value":"Value"}) 
    #     df = df.rename(columns = {" Question":"Question"}) 
    #     df = df.rename(columns = {" Answer":"Answer"})  

    #     if category not in df['Category'].values:
    #         # print(f'{category} NOT IN DATASET')
    #         category = ''

    #     if category is not None and category in df['Category'].values:
    #         df = df.loc[df['Category'] == category]
    #         # print(len(df['Question'].values))

    mk = generate_markov_key(df['Question'].values)
    starters = generate_starters(df['Question'].values, mk)

    category = category.replace('/', '-')

    with open(f"markov.json", "w") as outfile: 
        json.dump(mk, outfile)
    with open(f'markovStarters.json', 'w') as outfile:
        json.dump(starters, outfile)
        
    # else:
    #     with open(f'/resources/markov{category}.json') as json_file:
    #         mk = json.load(json_file)
    #     with open(f'/resources/markovStarters{category}.json') as json_file:
    #         starters = json.load(json_file)
    
    # output = []
    # for i in range(0, number):
    #     output.append(generate_question(6, 12, 25, mk, starters))
    # return output

def sets(df, categories, startI, increment):

    d0 = False
    d25 = False
    d50 = False
    d95 = False

    for i in range(startI, len(categories), increment):

        if not d0 and i/(len(categories)/increment) >= 0:
            d0 = True
            print(f'Thread {startI}: Started')
        elif not d25 and i/(len(categories)/increment) >= 0.25:
            d25 = True
            print(f'Thread {startI}: 25%')
        elif not d50 and i/(len(categories)/increment) >= 0.50:
            d50 = True
            print(f'Thread {startI}: 50%')
        elif not d95 and i/(len(categories)/increment) >= 0.95:
            d95 = True
            print(f'Thread {startI}: 95%')

        cat = categories[i]
        ddf = df.loc[df['Category'] == cat]
        get_questions(ddf, 1, cat)


if __name__ == '__main__':
    
    # category = None
    # if len(sys.argv) > 2:
    #     category = sys.argv[2]

    # sum = 0

    # for question in get_questions(int(sys.argv[1]), category):
    #     print(f'{question}\n')
        # sum += len(question)
    # print(f'    Average Length: {sum/int(sys.argv[1])}')

    df = pd.read_csv('./JEOPARDY_CSV.csv')
    df = df.rename(columns = {" Category":"Category"}) 
    df = df.rename(columns = {" Air Date":"Air Date"})
    df = df.rename(columns = {" Round":"Round"}) 
    df = df.rename(columns = {" Value":"Value"}) 
    df = df.rename(columns = {" Question":"Question"}) 
    df = df.rename(columns = {" Answer":"Answer"})  

    l = []
    for category in df['Category'].values:
        if category not in l:
            l.append(category)
    
    # p = []
    # for i in range(0, 4):
    #     p.append(multiprocessing.Process(target=sets, args=(df, l, i, 4)))
    #     p[-1].start()
    
    # for pi in p:
    #     pi.join()
    
    # catlen = len(l)
    # to_remove = []
    # for index, cat in enumerate(l):

    #     try:
    #         get_questions(1, cat)
    #     except IndexError as e:
    #         to_remove.append(cat)
    #     print(f'{index+1}/{catlen}')

    # for cat in to_remove:
    #     l.remove

    # get_questions(df, 1, '')

    with open('categories.txt', 'w') as fileout:

        ll = []
        for cat in l:
            cat = cat.replace('/', '-')
            cat = cat.replace('"', '')
            cat = cat.replace("'", '')

            if cat not in ll:
                ll.append(cat)

        for cat in ll:
            fileout.write(f'"{cat}",\n')   
 
