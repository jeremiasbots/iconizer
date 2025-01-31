#!/usr/bin/env bun
import { existsSync, readFileSync, writeFile } from "node:fs"
import { OpenAI } from "openai"
import axios from "axios"
const client = new OpenAI()

async function main() {
    if(process.argv[2] === undefined || process.argv[3] === undefined) {
        console.log("No hay imagen de entrada/salida.")
        process.exit(1)
    }

    if(!existsSync(process.argv[2])){
        console.log("No existe la imagen de entrada.")
        process.exit(1)
    }


    // Read file
    const file = readFileSync(process.argv[2]).toString('base64')

    /* Create prompt for icon */
    const completion = await client.chat.completions.create({
        model: "gpt-4-vision-preview",
        max_tokens: 100,
        messages: [
            { role: "user", content: [{ type: "text", text: "Describe the image" }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${file}` } }] }
        ]
    })
    /* Create prompt for icon */

    if(completion.choices[0] === undefined || completion.choices[0].message.content === null){
        console.log("Ha ocurrido un error al preguntar al modelo de analizar imagenes.")
        process.exit(1)
    }

    /* Create Icon */
    const promptImage = `${completion.choices[0].message.content}.\nYour role is an assistant, Draw the image as an ICON, you have to use only vectorial elements like lines, circles..`
    const image = await client.images.generate({
        model: "dall-e-3",
        prompt: promptImage,
        size: "1024x1024"
    })
    /* Create Icon */

    if(image.data[0] === undefined || image.data[0].url === undefined){
        console.log("Ha ocurrido un error al momento de generar la imagen.")
        console.log(promptImage)
        process.exit(1)
    }

    /* Download Image */
    const bytesIcon = (await axios.get(image.data[0].url, { responseType: "arraybuffer" })).data
    writeFile(process.argv[3], bytesIcon, (err) => {
        if(err) throw err
    })
    console.log("Imagen generada")
    /* Download Image */
}
main()