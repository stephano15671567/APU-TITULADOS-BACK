FROM node:slim
WORKDIR /titulados_api
COPY . /titulados_api
RUN npm install
EXPOSE 4000
CMD ["npm", "start"]