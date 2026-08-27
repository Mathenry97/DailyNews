import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { TOPICS } from "./topics";
import { generateTopicBlock } from "./generateTopic";
import type { TopicBlock, TopicKey } from "../../shared/types";

/**
 * Lance la génération des dix sujets en parallèle et écrit chaque résultat
 * dans functions/output/<date>/<topic>.json pour relecture/comparaison.
 */

type Result =
  | { key: TopicKey; ok: true; block: TopicBlock; ms: number }
  | { key: TopicKey; ok: false; error: string; ms: number };

async function generateOne(key: TopicKey, date: string): Promise<Result> {
  const start = Date.now();
  try {
    const block = await generateTopicBlock(key, date);
    return { key, ok: true, block, ms: Date.now() - start };
  } catch (err) {
    return { key, ok: false, error: (err as Error).message, ms: Date.now() - start };
  }
}

async function main() {
  const date = process.argv[2] ?? new Date().toISOString().slice(0, 10);
  const outDir = path.join(__dirname, "..", "output", date);
  await mkdir(outDir, { recursive: true });

  console.log(`Génération des ${TOPICS.length} sujets pour le ${date}...\n`);

  const results = await Promise.all(TOPICS.map((t) => generateOne(t.key, date)));

  for (const r of results) {
    if (r.ok) {
      await writeFile(path.join(outDir, `${r.key}.json`), JSON.stringify(r.block, null, 2), "utf-8");
    }
  }

  console.log("Sujet".padEnd(16), "Statut".padEnd(10), "Bullets", "Durée");
  console.log("-".repeat(50));
  for (const r of results) {
    if (r.ok) {
      const statut = r.block.isEmpty ? "vide" : "ok";
      console.log(
        r.key.padEnd(16),
        statut.padEnd(10),
        String(r.block.bullets.length).padEnd(7),
        `${(r.ms / 1000).toFixed(1)}s`
      );
    } else {
      console.log(r.key.padEnd(16), "ERREUR".padEnd(10), "-".padEnd(7), `${(r.ms / 1000).toFixed(1)}s  ${r.error}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} sujets générés avec succès.`);
  console.log(`Détail : ${outDir}`);

  if (failed.length > 0) process.exitCode = 1;
}

main();
