By route navigation:

/tools

Update the user preference and settings → From form Send to backend to save in a csv.

Backend having the service to load those settings, if the csv file does not have that, load it from env variables by default

Note for backend: We should have a service implementation (call this `dataservice`) and exposed the interfaces, at the moment that service save and loading the csv (we should have the a `database/` folder at the root directory and .git should ignore this at the moment.) and I’ll try with database later.

Another note for backend then → it’s should be embedded in angular ssr.

in the .env should have the key FILE_SUPPORTED and default value is “.pdf”, the form on UI should include that as well beside open key, open ai model, open ai proj id, open ai org id. sheet api key, sheet name, sheet id, … etc.

/tools/upload

An UI for uploading file, we also have a similar `dataservice` but on another csv, also should have. an interface for replacement later.

that service should generate id for each upload, the file should be placed in `database/` in root dir.

on UI should have a table 

/tools/convert-markdown

UI for input and data table for converting the uploaded file on the first step to markdown. the convert from should have dropdown to select uploaded file.

The data table below to see the command submitted, progress.

backend, also a `dataservice` to save the progress, the output file

the dataservice of this should return the list markdown we already have.

/tools/translate

Here the same logic with other tools but the input is list of original markdown, as a dropdown, user can select the target lang (can be en, vi for now (loaded from the. user setting as in the config (or .env see the first tool)))

The output should be another markdown file that matches the original markdown. or user can choose a strategy (dropdown) which is translating sentence by sentence - this strategy only available if user already use the tool breakdown to break the original markdown to the sentences.

/tools/compose

Where the forminputs are the dropdown to select the markdowns files we have (from the convert and from the translate)
also need `dataservice` to save and load the progress, input also have t he format of bilingual book (side by side, para by para, sentence by sentence,… (supported format should be in the setting dataservice as the step one.)).

Compose can have the default format that (compose only a translated md - only translated content).

/tools/convert-to-epub

This tool helps to convert the markdowns to epub file. the structure, data saving querying should be the same as the tools above.

the `businessservice` of this tool on backend should be able to return the list of epub to use in the later tool (sending mail)

/tools/send-mail

This tool should load the settings like email config in the user setting from `dataservice` of the first tool

On this tool, I can use 3 options of sending mail with special templates:

- Option one: Thank you user to use our service
- Option 2: Sorry for the delay
- Option 3: The book is ready with attached final epub (form input dropdown.)

`dataservice`  of this tool should save the progress, status of each mail send, 

`businessservice` able to return the list of email used. on the form, user can input new mail and a dropdown as suggestions get from list email.

/tools/content-breakdown

We should have a similar tool to breakdown a markdown file to csv (markdown id, chapter id, paragraph id, sentenceid, original content or anything similar to identify the part of that text in the original markdown) records stored with `dataservice` and business of breakingdown + fetching the list of breakingdown, mapping breakdown vs markdown in the `businessservice`.

/tools/translation-fine-tune

In order to tuning the translation to have the correct context. we need a tool to compare the original content breakdown vs translated content csv (use book as reference in the input drop down), each translated sentence map with the original sentence via sentence id in content breakdown. Display each sentence on its own paperlike input field (squared, no extra margin, padding, uyser can click to edit) - if the sentences belong to paragraph, dont breaklines, show the inputs next to each other to seeing that the sentences are next to each other in the real book. highlight the original sentence once the translated sentence is focused, the original sentence inputs are read only inputs.

This service find a way to map the translated to the original.

Once user clicks “save” the backend should update the translated content .csv respectively via the `dataservice` of translate tool backend service,

/tools/order-management

For crud bilingual book management. Each order must have the original file and translated file upload (optional (supported file from the setting )) the book name and author (requiremend), format (required) (drop down input from the settings), user email.

/tools/third-parites management

Such as print manifactures, ads, book shelf (tds). bookhshelf contain available books that user can order by just seletecting the order on the shelf and submit, we send the composed book to the print manifacture then ship that to the customer. Shipping partners,.. etc. we also have crud, table here.

- The record in csv file should have column to ref to the related file (pdf, md, …).
- `dataservice`s should be different from `businessservice`, business services are the stuff that actually process the file such as (converting, composing, uploading, generate ids, fallback settings,…) `businessservice` are the template holder to implement later.
- Business/ shared models should be in separated files to re uses, one model per file. one service per file, one data service per file.
- Document the development preference so the next increment should follow the rule.
- Theme UI design and color, form controls should look like cursor.com.
- Top nav have tools, and home, home currently should have nothing, the /tools nav would navigate to the tools page, you can see the routing design above.
- business service and dataservice should be used by server. the api endpoint should have prefix /api
- Implement docker build: nginx + port 80 + coordinating. access by direct url should work.
- All the method should be short, no Bloaters.
- Api should be prefixed with /api/tool-name/
- On server.ts routes of a tool must be separated to each file, so it’s easier to manage. api should have the swagger exposed at /api/docs
-