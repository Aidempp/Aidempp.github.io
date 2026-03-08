async function chargerVehicule(id) {
    const url = `http://monpompier.com/flux/vehicules/${id}.xml`;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        const channel = xml.querySelector("channel");
        if (!channel) return null;

        const nom = channel.querySelector("title")?.textContent.trim() || "Inconnu";

        const items = [...xml.querySelectorAll("item")];
        let statut = "Inconnu";
        let technique = {};
        let historique = [];

        for (const item of items) {
            const title = item.querySelector("title")?.textContent.trim() || "";
            const desc = item.querySelector("description")?.textContent.trim() || "";

            // Données techniques
            if (desc.includes("<idVehicule>")) {
                const inner = parser.parseFromString(desc, "text/xml");
                inner.childNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        technique[node.tagName] = node.textContent;
                    }
                });
            }

            // Historique
            if (title === "Changement d'état") {
                historique.push(desc);
                if (desc.includes("est :")) {
                    statut = desc.split("est :")[1].trim();
                }
            }
        }

        return { id, nom, statut, technique, historique };

    } catch (e) {
        return null;
    }
}
