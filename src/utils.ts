const extract_katakana = (text: string): Array<String> => {
    // Ref: https://gist.github.com/terrancesnyder/1345094
    // full_with_katakana = "ァ-ン"
    // half_with_katakana = "ｧ-ﾝﾞﾟ";
    // hypen = ー

    const matches = text.matchAll(/([ァ-ンｧ-ﾝﾞﾟー]+)/gm);

    let ret = [];
    for (let match of matches) {
        ret.push(match[1]);
    }

    return ret;
}

const is_text_page = (filename: string): boolean => {
    const support_exts = [".xhtml", ".html", ".htm"];

    for (let ext of support_exts) {
        if (filename.endsWith(ext))
            return true;
    }

    return false;
}

export {
    extract_katakana,
    is_text_page,
}