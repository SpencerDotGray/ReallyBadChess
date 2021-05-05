
import pandas as pd
from time import time

df = pd.read_csv('./JEOPARDY_CSV.csv')
df = df.rename(columns = {" Category":"Category"}) 
df = df.rename(columns = {" Air Date":"Air Date"})
df = df.rename(columns = {" Round":"Round"}) 
df = df.rename(columns = {" Value":"Value"}) 
df = df.rename(columns = {" Question":"Question"}) 
df = df.rename(columns = {" Answer":"Answer"}) 

thing = []

for question in df['Answer'].values:

    question = str(question)
    if len(question) >= 134:
        thing.append(question)

print(len(thing))

for answer in thing:
    print(answer)