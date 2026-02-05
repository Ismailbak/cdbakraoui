---
---
# Terms of Reference
## Development of a Local Artificial Intelligence Model Based on Rheumatology Electronic Health Records

**Final-Year Engineering Project**  
**February -- July 2026**

---

## Project Background

The Faculty of Medicine and Pharmacy of Casablanca (FMPC), part of Hassan II University of Casablanca, manages a significant volume of clinical data through its Rheumatology Electronic Health Record (EHR) system. These data represent a valuable resource for improving patient care and supporting clinical research.

Within this context, the Research Laboratory for Therapeutic Innovation and Artificial Intelligence in Health, under the supervision of Prof. Samy Housbane, aims to develop a **local artificial intelligence model** capable of analyzing rheumatology EHR data. The project prioritizes data security, ethical compliance, and adaptation to the local medical environment.

---

## Problem Statement

Rheumatologists must routinely analyze heterogeneous and longitudinal patient data, including structured clinical parameters and unstructured free-text notes. This complexity makes rapid and comprehensive patient assessment challenging.

Furthermore, the use of external cloud-based AI solutions raises serious concerns regarding patient data confidentiality and regulatory compliance. A secure, local, and purpose-built AI solution is therefore required to address these challenges.

---

## Project Objectives

### General Objective
Design and implement a **local AI-based system** that assists rheumatologists in analyzing, synthesizing, and exploiting EHR data for clinical support and research purposes.

### Specific Objectives
- Analyze the structure and content of the rheumatology EHR.
- Preprocess, anonymize, and structure medical data for AI exploitation.
- Develop and train machine learning models adapted to local clinical data.
- Ensure strict data security and on-premise deployment.
- Provide interpretable and clinically meaningful outputs.
- Facilitate the use of data for clinical and epidemiological research.

---

## Project Scope

### In Scope
- Use of anonymized rheumatology EHR data from FMPC.
- Development of a local AI model for data analysis and synthesis.
- Assistance to clinical decision-making without automation of diagnosis.
- Support for clinical research through cohort analysis and data exploration.

### Out of Scope
- Automated medical diagnosis or treatment prescription.
- Use of external cloud services for data processing or storage.
- Public access to patient data or unrestricted system access.

---

## Functional Requirements

- Processing of both structured and unstructured medical data.
- Generation of summarized and structured patient records.
- Extraction of relevant clinical information from free-text notes.
- Identification of trends and patterns within patient populations.
- User-friendly interface adapted to clinical workflows.

---

## Non-Functional Requirements

- Data confidentiality, anonymization, and ethical compliance.
- Acceptable response time for clinical usage.
- Robustness to missing or inconsistent data.
- Traceability and reproducibility of results.

---

## Technical Architecture (Overview)

The proposed system will rely on a modular, local architecture including:
- A secure local database for anonymized data storage.
- A data preprocessing and feature engineering pipeline.
- Machine learning and/or deep learning models implemented in Python.
- A local application server exposing model functionalities.
- A lightweight web-based user interface.

---

## Methodology

The project will follow an iterative data science methodology:
- Needs analysis and data exploration.
- Data preprocessing and feature engineering.
- Model development, training, and evaluation.
- System integration and testing.
- Validation with clinical users.
- Documentation and final reporting.

---

## Expected Deliverables

- Detailed terms of reference (this document).
- Data analysis and system design report.
- Trained and documented AI models.
- Functional local prototype.
- Technical and user documentation.
- Final project report and defense presentation.

---

## Supervision and Hosting

This project will be conducted at the Faculty of Medicine and Pharmacy of Casablanca under the supervision of Prof. Samy Housbane, within the Research Laboratory for Therapeutic Innovation and Artificial Intelligence in Health. All activities will comply with institutional data protection and confidentiality regulations.

---

## Recommended Tech Stack

To ensure a fast, lightweight, and secure conversational AI assistant that can access patient files and help doctors locally, the following stack is recommended:

**Model**
- Distilled or quantized French LLM (e.g., DistilCamemBERT, MiniLM, or a small fine-tuned CamemBERT/DrBERT)
- Sentence-transformers or Haystack for efficient Q&A and summarization

**Backend**
- FastAPI (lightweight, async, easy to deploy)
- Python scripts for secure access and preprocessing of patient data from the local database

**Frontend**
- Streamlit (quick, interactive, local web interface)
- Simple chat UI for doctor interaction

**Data Access**
- Backend fetches and anonymizes patient data (structured and unstructured) on request, providing context to the model

**Deployment**
- All components run on a local server or workstation
- Docker for easy setup and reproducibility

**Summary**
- Small, local French LLM (distilled/quantized)
- FastAPI backend for data/model serving
- Streamlit for chat UI
- All data and computation remain local for compliance
Terms of Reference 

Development of a Local Artificial Intelligence Model Based on Rheumatology Electronic Health Records

Project Type: Final-Year Engineering Project
Duration: February – July 2026
Host Institution: Faculty of Medicine and Pharmacy of Casablanca (FMPC), Hassan II University
Supervisor: Prof. Samy Housbane

1. Project Background

The Faculty of Medicine and Pharmacy of Casablanca manages a large volume of clinical data through its Rheumatology Electronic Health Record (EHR) system. These data include structured clinical information such as laboratory results and disease activity scores, as well as unstructured medical narratives from consultations and follow-ups.

This project aims to exploit these data by developing a local artificial intelligence (AI) solution capable of supporting rheumatologists in clinical practice and facilitating clinical research. The system will operate exclusively in a secure, on-premise environment, ensuring full compliance with medical data confidentiality and ethical regulations.

2. Problem Statement

Rheumatologists are required to analyze complex, heterogeneous, and longitudinal patient data within limited consultation time. Manual review of EHRs can be inefficient and may lead to incomplete information synthesis.

At the same time, the use of external or cloud-based AI tools raises serious concerns regarding patient data security and regulatory compliance. There is therefore a need for a custom, local, and secure AI system specifically adapted to rheumatology EHR data.

3. Project Objectives
General Objective

To design and implement a local AI-based system that assists rheumatologists in analyzing, summarizing, and exploiting EHR data for clinical support and research purposes.

Specific Objectives

Analyze the structure and content of rheumatology EHR data

Preprocess and anonymize medical data for AI use

Develop machine learning models adapted to local clinical data

Ensure strict data security and local deployment

Produce interpretable and clinically relevant outputs

Support clinical and epidemiological research activities

4. Project Scope
In Scope

Use of anonymized rheumatology EHR data from FMPC

Development and validation of a local AI model

Assistance with clinical data analysis and synthesis

Support for research through cohort identification and data exploration

Out of Scope

Automated medical diagnosis

Autonomous treatment or prescription generation

Use of external cloud services

Public or unrestricted access to patient data

5. Functional Requirements

Processing of both structured and unstructured medical data

Generation of summarized and structured patient profiles

Extraction of relevant clinical information from free-text records

Identification of patterns and trends in patient populations

User-friendly interface adapted to clinical workflows

6. Non-Functional Requirements

Strict data confidentiality and anonymization

Compliance with ethical and regulatory standards

Acceptable response times for clinical usage

Robustness to missing or inconsistent data

Traceability and reproducibility of results

7. Technical Overview

The proposed solution will be based on a modular local architecture including:

A secure local database

A data preprocessing and feature engineering pipeline

Machine learning and/or deep learning models developed in Python

A local application server

A lightweight web-based user interface

8. Methodology

The project will follow an iterative methodology:

Needs analysis and data exploration

Data preprocessing and feature engineering

Model development and evaluation

System integration and testing

Validation with clinical users

Documentation and final reporting

9. Expected Deliverables

Detailed terms of reference

Data analysis and system design report

Trained and documented AI models

Functional local prototype

Technical and user documentation

Final project report and presentation

10. Supervision and Hosting

The project will be conducted at the Faculty of Medicine and Pharmacy of Casablanca under the supervision of Prof. Samy Housbane, within the Research Laboratory for Therapeutic Innovation and Artificial Intelligence in Health. All work will be carried out in compliance with institutional data protection and confidentiality policies.


11. Recommended Tech Stack for Conversational AI

To ensure a fast, lightweight, and secure conversational AI assistant that can access patient files and help doctors locally, the following stack is recommended:

**Model**
- Distilled or quantized French LLM (e.g., DistilCamemBERT, MiniLM, or a small fine-tuned CamemBERT/DrBERT)
- Sentence-transformers or Haystack for efficient Q&A and summarization

**Backend**
- FastAPI (lightweight, async, easy to deploy)
- Python scripts for secure access and preprocessing of patient data from the local database

**Frontend**
- Streamlit (quick, interactive, local web interface)
- Simple chat UI for doctor interaction

**Data Access**
- Backend fetches and anonymizes patient data (structured and unstructured) on request, providing context to the model

**Deployment**
- All components run on a local server or workstation
- Docker for easy setup and reproducibility

**Summary**
- Small, local French LLM (distilled/quantized)
- FastAPI backend for data/model serving
- Streamlit for chat UI
- All data and computation remain local for compliance