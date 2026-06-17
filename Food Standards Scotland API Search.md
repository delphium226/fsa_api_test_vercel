# **The Digital Architecture of Food Safety in Scotland: API Integration, Open Data Standards, and Regulatory Surveillance**

The governance of food safety in the United Kingdom operates within a complex, devolved framework where policy independence is balanced against the necessity of technical interoperability. For Scotland, this dynamic is embodied by Food Standards Scotland (FSS), a public sector body established by the Food (Scotland) Act 2015 to act as the primary authority on food safety, standards, nutrition, and labelling.1 While FSS maintains distinct regulatory autonomy from the Food Standards Agency (FSA)—which oversees England, Wales, and Northern Ireland—the digital infrastructure supporting real-time food safety alerts remains a highly integrated, federated ecosystem. This report provides an exhaustive technical analysis of the Application Programming Interfaces (APIs), data structures, and open data protocols available to developers, researchers, and policy analysts seeking to interact with Scottish food safety data.

The core finding of this research is that while foodstandards.gov.scot serves as the primary informational portal for Scottish consumers and businesses, the programmatic backbone for *food safety alerts* is centrally hosted on the shared UK platform, data.food.gov.uk. This architectural decision reflects a strategy of semantic interoperability, allowing for region-specific filtering (e.g., filtering for "Scotland") within a unified data stream. This report will dissect the technical specifications of these endpoints, the schema of the available data, the strategic implications of FSS’s digital roadmap, and the specific mechanisms required to isolate Scottish data from the broader UK dataset.

## **Part I: The Institutional and Strategic Context of Scottish Food Data**

To understand the technical implementation of food safety APIs in Scotland, one must first appreciate the institutional context that dictates how data is generated, validated, and published. The divergence of Food Standards Scotland from the UK-wide FSA was a political and administrative reconfiguration, yet the biological and supply chain risks managed by these bodies remain borderless. Consequently, the data strategy adopted by FSS emphasizes "evidence-based" decision-making and "data-driven" surveillance, leveraging shared infrastructure where efficiency dictates, while building bespoke capabilities for distinct Scottish needs.2

### **The FSS Digital and Data Strategy (2026-2031)**

Food Standards Scotland operates under a rolling strategic framework that prioritizes the enhancement of digital capabilities. The "Refreshed Digital and Data Strategy," presented to the Board in December 2025, outlines a vision for the period 2026-2031.2 This document reveals a critical transition from reactive compliance monitoring to proactive, predictive risk analysis. The strategy underscores that digital and data capability underpins all five of FSS's strategic outcomes, with a particular focus on "Goal 3: A research and data science capability which enables us to detect risks, monitor public health trends and consumer behaviours".2

This strategic orientation explains the current state of the API ecosystem. The reliance on the FSA’s data.food.gov.uk infrastructure for alerts is not merely a legacy arrangement but a calculated utilization of resources to allow FSS to focus its limited "headcount and budget" on high-value, Scotland-specific research initiatives, such as the "Understanding Scotland's Diet" program and the "Intake24" dietary surveillance tool.3 The Board papers note the "limitations associated with this area of work in light of our existing capabilities," suggesting that while FSS is aggressive in its data ambitions, it pragmatically leverages shared services for commoditized data functions like alert dissemination.2

### **The Role of the Scottish Food Crime and Incidents Unit (SFCIU)**

The generation of the data that eventually populates the API is largely driven by the operational activities of the Scottish Food Crime and Incidents Unit (SFCIU).1 This unit is responsible for managing "food incidents," which are broadly categorized into hazardous and non-hazardous events.

| Incident Category | Description | Examples | Data Implication |
| :---- | :---- | :---- | :---- |
| **Hazardous** | Potential to cause adverse health effects. | Microbiological (Salmonella, Listeria), Chemical (Pesticides), Physical (Glass/Metal). | Triggers immediate "Food Alert for Action" (FAFA) or "Product Recall Information Notice" (PRIN). |
| **Non-Hazardous** | Detrimental to consumer interests but not immediately toxic. | Mislabelling, Provenance fraud, Authenticity issues, Compositional standards. | May trigger "Withdrawal Information Notices" or updates to the "Food Hygiene Information Scheme." |

5

When the SFCIU identifies a risk—often in collaboration with local authorities—the incident is logged and evaluated. If the risk necessitates a public recall or withdrawal, the data is structured and pushed to the central alerts database. Crucially, if a product is distributed in Scotland, even if the incident originated elsewhere, an alert is tagged with the Scottish geographical identifier (GB-SCT), ensuring it appears in filtered API queries specific to the region.7

## **Part II: The Primary Alerts API Architecture**

The technical gateway for accessing food safety alerts affecting Scotland is the **FSA Food Alerts API**, hosted at https://data.food.gov.uk/food-alerts. This API is a RESTful service that provides access to current and recent alerts, including Allergy Alerts (AA), Product Recall Information Notices (PRIN), and Food Alerts for Action (FAFA).9 The service is currently in a "beta" state, a designation that implies stability in core endpoints but allows for iterative improvements without the rigid ossification of a legacy enterprise service.10

### **API Endpoint Specifications**

The API is designed with a resource-oriented architecture. The root endpoint provides a list of alerts, while specific sub-paths provide access to reference data (vocabularies) and individual alert details. The API supports content negotiation and can return data in multiple formats, including JSON (the industry standard for web development), CSV (for data analysis), and RDF/Turtle (for semantic web applications).10

| Resource Description | Endpoint URL | Supported Methods | Supported Formats |
| :---- | :---- | :---- | :---- |
| **List of Alerts** | /food-alerts/id | GET | JSON, HTML, CSV, RDF, TTL |
| **Single Alert Detail** | /food-alerts/id/{id} | GET | JSON, HTML, CSV, RDF, TTL |
| **Allergen Codes** | /food-alerts/def/allergens | GET | JSON, HTML |
| **Pathogen Risks** | /food-alerts/def/pathogen-risks | GET | JSON, HTML |
| **Hazard Categories** | /food-alerts/def/hazards | GET | JSON, HTML |
| **Reason Codes** | /food-alerts/def/reasons | GET | JSON, HTML |

10

### **Query Parameters and Pagination**

To manage the potentially large volume of alert data, the API implements pagination and filtering via query parameters. This is critical for developers building applications that need to synchronize a local database with the central authority without downloading the entire historical dataset on every request.

* **Pagination:** The API uses \_limit and \_offset parameters. The default limit is often set to 10 or 50 items depending on the view. The meta block in the JSON response confirms the applied limit.10  
* **Time-Based Filtering:** While the snippets do not explicitly detail a since parameter, the standard pattern for this API involves filtering by created or modified dates, which are returned in ISO 8601 format (e.g., 2018-01-29T16:17:27+00:00).10  
* **Content Type:** The format can be requested via the Accept header or by appending the extension (e.g., .json, .csv) to the URI.11

### **The JSON Data Model**

The response structure of the API is highly formalized, adhering to Linked Data principles. A typical JSON response consists of two top-level keys: meta and items.10

#### **The Meta Block**

The meta object provides essential context about the response envelope. It includes the software version (0.3 in the examples), the license (Open Government Licence v3.0), the publisher (Food Standards Agency), and comments regarding the service status (e.g., "Updated beta-service").10 This metadata allows consuming applications to programmatically verify that they are interacting with the correct version of the API and are compliant with licensing terms.

#### **The Items Block and Linked Data Fields**

The items array contains the core data. Each element in this array is an alert object containing rich, semantic data.

* **@id:** A dereferenceable URI identifying the alert (e.g., http://data.food.gov.uk/food-alerts/id/FSA-AA-01-2018). This is the primary key for the record.10  
* **notation:** A human-readable reference number (e.g., FSA-AA-01-2018) used in correspondence and public notices.10  
* **country:** A crucial field for Scottish users. This field usually contains a list of URIs representing the nations to which the alert applies (e.g., http://data.food.gov.uk/codes/geographies/countries/GB-SCT).  
* **problem:** A structured array describing the hazard. This often includes nested objects linking to the hazard or allergen definitions.10  
* **productDetails:** An array containing specific information about the affected items, such as batch codes, "Best Before" dates, and pack sizes.10

## **Part III: Geographic Filtering and Scottish Specificity**

The "problem" of accessing Scottish data specifically is solved through the API’s robust geospatial tagging. Unlike a system that separates data into different silos (a "Scottish database" vs. an "English database"), the UK model uses a single "Data Lake" where each entry is tagged with its relevant jurisdictions.

### **The country Field Mechanism**

For an alert to be relevant to Scotland, it must be tagged with the Scottish country code. In the API's underlying ontology, Scotland is defined as a skos:Concept and a UK nation.8

**Key Identifiers for Scotland:**

* **URI:** http://data.food.gov.uk/codes/geographies/countries/GB-SCT.8  
* **Notation:** GB-SCT.8  
* **PrefLabel:** "Scotland".8  
* **Statistical Geography Code:** S92000003.12

When filtering the API, developers can target these identifiers. The API documentation implies that filtering by country.label or country.notation is supported.10

#### **Constructing a Scotland-Specific Query**

To retrieve a list of alerts applicable to Scotland, a developer would construct a GET request filtering for the GB-SCT notation.

GET https://data.food.gov.uk/food-alerts/id?country=GB-SCT

Alternatively, processing the full stream and filtering client-side for the presence of the Scottish URI in the country array is a robust strategy, as some alerts may apply to "United Kingdom" (GB) generally, which hierarchically includes Scotland.13 The country field is multi-valued; an alert affecting the entire island of Great Britain might list England, Scotland, and Wales explicitly, or use the broader GB code.10

**Analysis of CSV Output for Regional Logic:** Examination of CSV exports from the API shows the country.label column frequently containing pipe-separated values such as Scotland|Scotland|Wales|Wales.14 This redundancy suggests that the underlying data model might allow for multiple distinct "reasons" or "products" within a single alert to trigger the geographic tag multiple times. A robust parser must handle these pipe-delimited strings to accurately determine regional applicability.15

### **Cross-Border Data Propagation**

The integration between FSS and FSA systems ensures that alerts are propagated across borders. If a product recall is initiated in England (e.g., by a manufacturer based in London) but the distribution network includes Scottish supermarkets, the FSA tags the alert with GB-SCT. This triggers the alert to appear on the foodstandards.gov.scot website and in the inboxes of Scottish subscribers.7 This mechanism relieves FSS of the burden of duplicating data entry for incidents originating outside its direct jurisdiction, ensuring that the data.food.gov.uk endpoint remains the "Single Source of Truth" for the entire UK market.

## **Part IV: The Food Hygiene Information Scheme (FHIS) API**

While the Food Alerts API handles acute incidents (recalls, outbreaks), the **Food Hygiene Information Scheme (FHIS)** API handles the chronic, structural safety data of food businesses. This is the second major API pillar for Scottish food data. It is vital to distinguish between the FHRS (Food Hygiene Rating Scheme) used in the rest of the UK and the FHIS used in Scotland, as they employ different rating logic and data structures.17

### **FHIS vs. FHRS: Technical Differences**

* **FHRS (England/Wales/NI):** Uses a numerical score from 0 to 5\.  
* **FHIS (Scotland):** Uses a binary/ternary status: "Pass," "Improvement Required," or "Awaiting Inspection".18

The API at https://api.ratings.food.gov.uk/ serves data for both schemes, but developers must interpret the RatingValue field differently based on the SchemeType associated with the local authority.19

### **Accessing Scottish Hygiene Data**

Data in the Ratings API is organized by Local Authority. To access Scottish data, one must query authorities that fall under the Scottish jurisdiction.

**Example: Aberdeenshire Council**

* **Authority ID:** 9031\.20  
* **URI:** http://data.food.gov.uk/codes/reference-number/authority/9031.20  
* **Region:** Scotland.20

A developer seeking all hygiene ratings for Aberdeenshire would utilize the endpoint:

GET https://api.ratings.food.gov.uk/Establishments?localAuthorityId=9031

**Headers and Versioning:**

Unlike the Alerts API, the Ratings API enforces strict versioning via headers.

* Header: x-api-version: 2\.21  
* Language: Accept-Language: en-GB (Note: While Welsh is supported, Scottish data is English-only).21

### **Data Freshness and "Open Data" Files**

For use cases requiring bulk analysis (e.g., analyzing the hygiene trends of 20,000 Scottish restaurants), the API offers "Open Data Files" in XML and JSON format. These are static snapshots updated daily, which are more efficient than iterating through thousands of API pages.11

* **JSON Snapshot URL Pattern:** https://ratings.food.gov.uk/OpenDataFiles/FHRS{AuthorityID}en-GB.json.11  
* **Example for Aberdeenshire:** https://ratings.food.gov.uk/OpenDataFiles/FHRS9031en-GB.json.11

## **Part V: The FSS Open Data Portal and Static Datasets**

While the dynamic APIs are hosted on shared UK infrastructure, Food Standards Scotland maintains a specific **Open Data Portal** at foodstandards.gov.scot/science-and-evidence/open-data-portal.22 This portal acts as a repository for datasets that do not require real-time APIs or are specific to Scottish regulatory functions not covered by the FSA.

### **Taxonomy of Available Datasets**

The portal currently hosts approximately 14 datasets, categorized by topic (Safety, Enforcement, Regulation, etc.).22 These datasets are crucial for researchers conducting longitudinal studies on the efficacy of food regulation in Scotland.

1. **Approved Establishments in Scotland:**  
   * *Description:* A comprehensive register of all establishments approved to handle products of animal origin (meat, dairy, fish). This is a subset of the UK-wide list but maintained specifically for FSS governance.23  
   * *Format:* Typically CSV or Excel.  
   * *Update Frequency:* Monthly snapshots.23  
2. **Fishing Vessel Registrations:**  
   * *Description:* Data on the compliance status of fishing vessels registered as food businesses. This is particularly relevant given Scotland's significant seafood industry.22  
   * *Significance:* This dataset allows for the cross-referencing of catch data with hygiene compliance, a critical link in the seafood supply chain.  
3. **Eat Safe Awards:**  
   * *Description:* A distinct Scottish initiative promoting excellence in food hygiene (going beyond the basic "Pass" of FHIS).  
   * *Data Point:* This dataset identifies the "elite" tier of food businesses in Scotland.22  
4. **Game Handling and Abattoir Throughput:**  
   * *Description:* Throughput data in approved abattoirs and game handling establishments.22  
   * *Use Case:* Essential for agricultural economists and supply chain analysts monitoring the flow of meat products through the Scottish processing sector.  
5. **Multi-Species Ante-Mortem & Post-Mortem Conditions:**  
   * *Description:* Veterinary data collected by FSS staff at abattoirs, detailing the health conditions of animals presented for slaughter.22  
   * *Public Health Implication:* This is a primary surveillance dataset for animal health and zoonotic disease monitoring.

### **Limitations of the Open Data Portal**

It is important to note that the FSS Open Data Portal functions primarily as a file repository rather than a queryable database service. The interaction model involves downloading full datasets rather than filtering via API parameters. This distinction is critical for system architects; while the *Alerts API* allows for real-time application integration, the *Open Data Portal* is designed for periodic analytical ingestion.

## **Part VI: Semantic Web, Linked Data, and Vocabularies**

A distinguishing feature of the UK’s food data infrastructure is its heavy reliance on **Semantic Web** technologies. The API responses are not merely strings and numbers; they are webs of interconnected **Uniform Resource Identifiers (URIs)**. This approach, known as Linked Data, ensures that concepts are rigorously defined and machine-readable across different systems.

### **The Role of data.food.gov.uk/codes**

The data.food.gov.uk platform hosts a registry of controlled vocabularies. These registries define the "concepts" used in the alerts.

* **Allergens:** Rather than simply the string "Peanut", the API uses a URI like http://data.food.gov.uk/codes/allergens/peanut. This eliminates ambiguity (e.g., "Groundnut" vs "Peanut").  
* **Hazards:** Risks are categorized using URIs such as http://data.food.gov.uk/codes/alerts/def/hazard/pathogen.12  
* **Geographies:** As discussed, Scotland is defined by GB-SCT.

### **RDF and Turtle Support**

The API’s support for **Resource Description Framework (RDF)** and **Turtle (TTL)** formats allows for sophisticated querying using SPARQL (though a public SPARQL endpoint is not explicitly documented in the snippets, the presence of RDF implies the data is structured for it).25

**Example TTL Snippet for Scotland:**

Code snippet

\<http://data.food.gov.uk/codes/geographies/countries/GB-SCT\>   
    a skos:Concept ;  
    rdfs:label "Scotland"@en ;  
    skos:prefLabel "Scotland" ;  
    dct:description "Scotland (GB-SCT) \- United Kingdom Country: Scotland".

8

This semantic richness enables researchers to "walk the graph." For example, an algorithm could start with a specific alert, follow the link to the productDetails, then follow the link to the hazard, and finally link to the country to automatically generate a report on "Pathogen risks in Scottish dairy products."

## **Part VII: Developer Implementation Guide**

For a developer tasked with integrating Scottish food safety alerts into an application, the following implementation strategy is recommended based on the research findings.

### **1\. Polling vs. Webhooks**

While modern architectures often favor webhooks, the FSA API snippets suggest a polling mechanism is the standard free approach. However, third-party integrations (like Zapier) can be configured to poll the API and synthesize a webhook event.25

**Recommended Polling Strategy:**

* **Endpoint:** https://data.food.gov.uk/food-alerts/id  
* **Parameters:** ?country=GB-SCT&\_sort=-created&\_limit=10  
* **Frequency:** Every 15-60 minutes (alerts are not high-frequency trading data; sub-second latency is rarely required).  
* **Logic:**  
  1. Fetch the latest 10 alerts sorted by creation date.  
  2. Compare the @id of the returned alerts against a locally stored list of "processed" alert IDs.  
  3. If a new ID is found, parse the problem and productDetails fields.  
  4. Trigger the notification workflow.

### **2\. Handling the "Beta" Status**

The API is labeled as a "beta service".10 In government digital services (following the GDS Service Manual), "beta" usually means the service is public and working but may undergo changes. Developers should:

* **Monitor the meta block:** Check the comment field for deprecation warnings.10  
* **Implement Robust Error Handling:** The API might occasionally return 5xx errors during maintenance. Exponential backoff strategies are essential.  
* **Version Pinning:** If future versions are released, the API URL structure (e.g., /v1/) or headers should be strictly observed to prevent breaking changes.

### **3\. Client-Side Filtering for Robustness**

Given the complexity of the country tagging (sometimes it is "United Kingdom", sometimes "Scotland"), a robust application should cast a wide net.

* **Query:** Fetch country=GB AND country=GB-SCT.  
* **Filter:** In the application logic, check if the alert applies to Scotland. Note that an alert tagged *only* as GB (Great Britain) implicitly applies to Scotland. Filtering *only* for GB-SCT might miss UK-wide alerts that didn't explicitly tag every nation individually.

## **Part VIII: Future Directions and Strategic Analysis**

Looking ahead to the 2026-2031 strategic period, the landscape of food safety data in Scotland is poised for evolution. The FSS commitment to "embedding digitalisation" suggests we may see more granular, real-time data becoming available directly from FSS systems, potentially bridging the gap between the static Open Data Portal and the dynamic FSA API.3

### **The Role of "Intake24" and Dietary Data**

A key area of innovation is the **Intake24** tool, used for collecting dietary intake data.4 Currently, this is a research tool, but the FSS strategy hints at establishing a "robust dietary surveillance programme".4 In the future, one might expect APIs that allow for the querying of anonymized aggregate dietary trends, enabling correlations between food safety incidents and consumption patterns.

### **From "Official Controls" to "Data Science"**

The shift described in Board papers from manual "Official Control" recording to a "Data Science capability" 2 implies a future where inspection data is not just recorded but analyzed predictively. This could lead to new API endpoints providing "Risk Scores" or "Trending Hazards" rather than just raw alert lists, allowing food businesses to proactively manage supply chain risks before they become recalls.

## **Conclusion**

The answer to the query "can you find any api end points for food safety alerts issued by food standards agency in scotland" is nuanced. There is no isolated "Scottish API." Instead, there is a **Scottish view** of the **UK API**.

**Summary of Endpoints:**

1. **Alerts (Real-Time):** https://data.food.gov.uk/food-alerts/id?country=GB-SCT  
2. **Hygiene Ratings (Structural):** https://api.ratings.food.gov.uk/ (filtered by Scottish Local Authority IDs).  
3. **Static Datasets (Archive):** https://www.foodstandards.gov.scot/science-and-evidence/open-data-portal

This federated architecture serves the dual purpose of maintaining the political autonomy of Food Standards Scotland (through branded portals and specific data tagging) while ensuring the economic and safety benefits of a unified, cross-border recall system. For the developer, the task is one of filtering and interpretation: utilizing the GB-SCT notations and Semantic Web definitions to extract the specific Scottish signal from the UK-wide data noise. By adhering to the protocols of the FSA's Linked Data infrastructure, one can build robust, Scotland-specific safety applications that are synchronized with the official regulatory pulse of the nation.

#### **Works cited**

1. How we work | Food Standards Scotland \- The Scottish Government, accessed February 4, 2026, [https://www.foodstandards.gov.scot/about-us/how-we-work](https://www.foodstandards.gov.scot/about-us/how-we-work)  
2. A Refreshed Digital and Data Strategy for FSS \- Food Standards Scotland, accessed February 4, 2026, [https://www.foodstandards.gov.scot/sites/default/files/2025-12/Refreshed%20Digital%20and%20Data%20Strategy%20-%20Board%20Meeting%20-%202025%20December%2010%20-%20251209.pdf](https://www.foodstandards.gov.scot/sites/default/files/2025-12/Refreshed%20Digital%20and%20Data%20Strategy%20-%20Board%20Meeting%20-%202025%20December%2010%20-%20251209.pdf)  
3. Digital and Data Strategy \- Food Standards Scotland, accessed February 4, 2026, [https://www.foodstandards.gov.scot/sites/default/files/migration/downloads/05\_-\_Board\_Meeting\_-\_Digital\_and\_Data\_Strategy\_Presentation\_-\_2022\_October\_25\_-\_221005.pdf](https://www.foodstandards.gov.scot/sites/default/files/migration/downloads/05_-_Board_Meeting_-_Digital_and_Data_Strategy_Presentation_-_2022_October_25_-_221005.pdf)  
4. Food and Health Research Programme | Food Standards Scotland, accessed February 4, 2026, [https://www.foodstandards.gov.scot/science-and-evidence/food-and-health-research-programme](https://www.foodstandards.gov.scot/science-and-evidence/food-and-health-research-programme)  
5. Food Alerts \- Aberdeenshire Council, accessed February 4, 2026, [https://www.aberdeenshire.gov.uk/business/food-safety/food-safety-what-we-do/food-alerts](https://www.aberdeenshire.gov.uk/business/food-safety/food-safety-what-we-do/food-alerts)  
6. What are food or feed incidents | Food Standards Scotland, accessed February 4, 2026, [https://www.foodstandards.gov.scot/consumer-advice/food-safety/food-incidents/what-are-food-or-feed-incidents](https://www.foodstandards.gov.scot/consumer-advice/food-safety/food-incidents/what-are-food-or-feed-incidents)  
7. Subscribe | Food Standards Scotland, accessed February 4, 2026, [https://www.foodstandards.gov.scot/subscribe](https://www.foodstandards.gov.scot/subscribe)  
8. geographies/countries/GB-SCT \- Food Standards Agency Codes, accessed February 4, 2026, [https://data.food.gov.uk/codes/geographies/countries/GB-SCT](https://data.food.gov.uk/codes/geographies/countries/GB-SCT)  
9. Food Alerts \- API Catalogue, accessed February 4, 2026, [https://www.api.gov.uk/fsa/food-alerts/](https://www.api.gov.uk/fsa/food-alerts/)  
10. FSA Food Alerts API Documentation, accessed February 4, 2026, [https://data.food.gov.uk/food-alerts/ui/reference](https://data.food.gov.uk/food-alerts/ui/reference)  
11. Food Hygiene Rating Scheme Status, accessed February 4, 2026, [https://api.ratings.food.gov.uk/Help/Status](https://api.ratings.food.gov.uk/Help/Status)  
12. RDF \- FSA Data \- Food Standards Agency, accessed February 4, 2026, [https://data.food.gov.uk/food-alerts/id/FSA-AA-17-2020.ttl](https://data.food.gov.uk/food-alerts/id/FSA-AA-17-2020.ttl)  
13. Food Standards Agency Codes : geographies/countries/GB \- FSA Data Catalog, accessed February 4, 2026, [https://data.food.gov.uk/codes/geographies/countries/GB](https://data.food.gov.uk/codes/geographies/countries/GB)  
14. CSV \- FSA Data, accessed February 4, 2026, [https://data.food.gov.uk/food-alerts/id/FSA-AA-27-2020.csv](https://data.food.gov.uk/food-alerts/id/FSA-AA-27-2020.csv)  
15. CSV \- FSA Data, accessed February 4, 2026, [https://data.food.gov.uk/food-alerts/id.csv?\_limit=50\&problem.allergen=walnut](https://data.food.gov.uk/food-alerts/id.csv?_limit=50&problem.allergen=walnut)  
16. CSV \- FSA Data Catalog, accessed February 4, 2026, [https://data.food.gov.uk/food-alerts/id/FSA-PRIN-18-2021.csv](https://data.food.gov.uk/food-alerts/id/FSA-PRIN-18-2021.csv)  
17. UK Food Hygiene Rating data API \- Food Standards Agency, accessed February 4, 2026, [https://www.food.gov.uk/uk-food-hygiene-rating-data-api](https://www.food.gov.uk/uk-food-hygiene-rating-data-api)  
18. Our data | Food Standards Agency, accessed February 4, 2026, [https://www.food.gov.uk/our-data](https://www.food.gov.uk/our-data)  
19. Download ratings data | title \- Food Hygiene Ratings \- Food Standards Agency, accessed February 4, 2026, [https://ratings.food.gov.uk/open-data](https://ratings.food.gov.uk/open-data)  
20. Food Standards Agency Codes : reference-number/authority/\_9031 \- FSA Data Catalog, accessed February 4, 2026, [https://data.food.gov.uk/codes/reference-number/authority/\_9031:4](https://data.food.gov.uk/codes/reference-number/authority/_9031:4)  
21. Food Hygiene Rating Scheme API (Version 2\) \- Food Standards Agency, accessed February 4, 2026, [https://www.food.gov.uk/food-hygiene-rating-scheme-api-version-2](https://www.food.gov.uk/food-hygiene-rating-scheme-api-version-2)  
22. Open data portal | Food Standards Scotland, accessed February 4, 2026, [https://www.foodstandards.gov.scot/science-and-evidence/open-data-portal](https://www.foodstandards.gov.scot/science-and-evidence/open-data-portal)  
23. Datasets matching: search for 'Food' \- FSA Data Catalog, accessed February 4, 2026, [https://data.food.gov.uk/catalog/datasets?activity=1\&search=Food](https://data.food.gov.uk/catalog/datasets?activity=1&search=Food)  
24. Featured datasets \- FSA Data Catalog \- Food Standards Agency, accessed February 4, 2026, [https://data.food.gov.uk/catalog/datasets?activity=1](https://data.food.gov.uk/catalog/datasets?activity=1)  
25. Exploring the use of Zapier and the FSA Food Alerts data \- Epimorphics, accessed February 4, 2026, [https://www.epimorphics.com/zapier-and-fsa-food-alerts/](https://www.epimorphics.com/zapier-and-fsa-food-alerts/)