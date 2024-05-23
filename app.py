
# Importing necessary modules

from dotenv import load_dotenv
import os
import pandas as pd
from langchain.document_loaders import Document
from langchain.vectorstores import FAISS
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

# Loading environment variables from  .env file, and retrieving the OpenAI API Key

load_dotenv()

openai_api_key = os.getenv('OPENAI_API_KEY')

# Checking if the OpenAI API Key is present

if not openai_api_key:
    raise ValueError("OpenAI API key not found in environment variables.")

# Loading the dataset (CSV)

df = pd.read_csv("salaries.csv")

# Creating a list to store document objects

documents = []

# Iterating over each row in the DataFrame

for _, row in df.iterrows():
    doc = Document(page_content=row.to_json())      # Converting each row to JSON and creating a Document object
    documents.append(doc)       # Appending the Document object to the list of documents

embeddings = OpenAIEmbeddings(api_key=openai_api_key)   # Initializing embeddings using the OpenAI API
db = FAISS.from_documents(documents, embeddings)   # Creating a vector store using FAISS from the list of documents and embeddings

# Initializing the language model using the OpenAI API

llm = OpenAI(api_key=openai_api_key, temperature=0.7)

# Defining a template for generating prompts

prompt_template = PromptTemplate(
    template="You are a helpful assistant with knowledge about business and salaries. Use the following data to answer questions accurately.\n\n{context}\n\nQuestion: {question}\n\nAnswer:",
    input_variables=["context", "question"]
)

# Initializing a retrieval-based QA system


qa_chain = RetrievalQA(
    retriever=db.as_retriever(),
    llm=llm,
    prompt_template=prompt_template
)


# Function to get response for a given question

def get_response(question):
    response = qa_chain.run(question)
    return response

# Function to interactively chat with the chatbot

def chat():
    print("Welcome to the Salary Data Chatbot! Ask any question about the salary data.")
    while True:
        question = input("You: ")
        if question.lower() in ['exit', 'quit']:
            print("Goodbye!")
            break
        response = get_response(question)
        print(f"Bot: {response}")

if __name__ == "__main__":
    chat()       # Start the chat function