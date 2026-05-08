from django.conf import settings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# Classification options returned by this chain: db | ragflow | both | none
#
# - "db"      → user question can be answered via SQL on the structured database
# - "ragflow" → answer requires unstructured documents from RAGFlow
# - "both"    → both sources needed
# - "none"    → general question, no data retrieval needed
#
# [PLACEHOLDER] Add schema summary and unstructured data description below
# so the classifier knows what lives in each source.
CLASSIFIER_SYSTEM_PROMPT = """You are a routing classifier for a question-answering system.
Based on the user's question decide which data source to query.
Respond with ONLY one of these four words: db, ragflow, both, none

Rules:
- "db": question asks for structured/numerical data (counts, stats, records, financial figures)
- "ragflow": question asks about documents, policies, procedures, or unstructured knowledge
- "both": question needs both structured and unstructured data
- "none": general question that does not require any data retrieval

[PLACEHOLDER: Insert structured database schema summary here]

[PLACEHOLDER: Insert unstructured data categories here]
"""


def get_classifier_chain():
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        openai_api_key=settings.CLASSIFIER_LLM_API_KEY,
        openai_api_base=settings.CLASSIFIER_LLM_BASE_URL,
        temperature=0,
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", CLASSIFIER_SYSTEM_PROMPT),
            ("human", "{question}"),
        ]
    )
    return prompt | llm | StrOutputParser()
