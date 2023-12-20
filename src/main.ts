import * as utils from '~/utils';
import * as zip from "@zip.js/zip.js";


let workerConfiguration: zip.WorkerConfiguration = {
  useWebWorkers: true,
  useCompressionStream: true,
}

let zipReaderOptions: zip.ZipReaderOptions = {
  checkSignature: true,
  password: undefined,
}


export function test_zip() {
  var input = document.createElement('input');
  input.type = 'file';
  input.onchange = async (e: Event) => {
    let file = (<HTMLInputElement>e.target)!.files![0];

    let epub = new Epub(file);

    await epub.getKatakana();
  }
  input.click();
}

export class Epub<Type> {
  readonly file: File;

  epub: zip.ZipReader<Type>
  entries_cache: zip.Entry[] | null = null;

  constructor(file: File) {
    this.file = file;
    this.epub = new zip.ZipReader(new zip.BlobReader(file));
  }

  async getKatakana(): Promise<Map<string, number>> {
    if (this.entries_cache == null) {
      this.entries_cache = await this.epub.getEntries();
    }

    let mm = new Map();

    let options: zip.EntryGetDataOptions = { ...zipReaderOptions, ...workerConfiguration };

    await Promise.all(
      this.entries_cache.map(async (entry) => {
        const filename = entry.filename;
        if (!utils.is_text_page(filename)) {
          console.debug(`Ignore file: ${filename}`)
          return;
        }
        console.debug(`Processing ${filename}`);
        let data = await entry.getData!(new zip.BlobWriter(), options)
        let text = await data.text();

        let katakanas = utils.extract_katakana(text);

        for (let kata of katakanas) {
          let val = mm.get(kata) || 0;
          val += 1;
          mm.set(kata, val);
        }
      })
    )

    let mmSorted = new Map(
      [...mm.entries()].sort((a, b) => {
        // ref: https://stackoverflow.com/questions/24080785/sorting-in-javascript-shouldnt-returning-a-boolean-be-enough-for-a-comparison
        return b[1] - a[1]
      })
    )

    console.log("Katakana List:", mmSorted);

    return mmSorted;
  }


}

export const hello = (name: string) => {
  return `Hello ${name}!`;
}
