import { getSupabaseClient } from "./supabase";

async function main() {
  const date = process.argv[2] ?? new Date().toISOString().slice(0, 10);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("topic_blocks")
    .select("topic, date, is_empty, generated_at")
    .eq("date", date)
    .order("topic");

  if (error) {
    console.error("Erreur:", error.message);
    process.exit(1);
  }

  console.log(`${data.length} ligne(s) trouvée(s) pour le ${date} :`);
  for (const row of data) {
    console.log(`  ${row.topic.padEnd(16)} isEmpty=${row.is_empty}  generatedAt=${row.generated_at}`);
  }
}

main();
