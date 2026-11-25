"""Analyze supplied author annotations without changing the signed input files."""
import csv
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'results/consolidated_analysis'
OUTPUT = ROOT / 'results/human_review'


def parse_labels(text):
    if text.strip().lower() == 'ninguna':
        return set()
    labels = set()
    for token in text.split(';'):
        match = re.fullmatch(r'(P[123]|M[123]|Pi[123])@(\d+)', token.strip())
        if not match:
            raise ValueError('Invalid or undecided label: ' + token)
        pair = (match[1], int(match[2]))
        if pair in labels:
            raise ValueError('Duplicate operator/step label')
        labels.add(pair)
    return labels


def read_form(name):
    with (SOURCE / name).open(encoding='utf-8-sig', newline='') as stream:
        rows = list(csv.DictReader(stream))
    assert len(rows) == 10 and len({r['session_id'] for r in rows}) == 10
    for row in rows:
        assert row['task_completed'] in ['true', 'false']
        assert row['justification'].strip()
        parse_labels(row['operator_step_labels'])
    return {r['session_id']: r for r in rows}


def main():
    files = ['revision_Leonardo.csv', 'revision_German.csv', 'consenso_revision.csv']
    a, b, consensus = [read_form(name) for name in files]
    records = {r['id']: r for r in map(json.loads, (ROOT / 'results/multiagent_run/records.jsonl').read_text().splitlines())}
    audits = [json.loads(line) for line in (ROOT / 'results/multiagent_run/audit.jsonl').read_text().splitlines()]
    packet = json.loads((SOURCE / 'human_review_packet.json').read_text())
    assert set(a) == set(b) == set(consensus) == {r['id'] for r in packet['sessions']}
    comparisons = []
    for session_id in a:
        record = records[session_id]
        steps = {e['step'] for e in record['events']}
        left, right, final = [parse_labels(form[session_id]['operator_step_labels']) for form in [a, b, consensus]]
        assert all(step in steps for _, step in left | right | final)
        automatic = {(op, label['step']) for label in record['labels'] for op in label['operators']}
        monitor = {(v['op'], event['step']) for event in audits if event['trace_id'] == record['traceId'] for v in event['violations']}
        comparisons.append({
            'session_id': session_id, 'reviewer_a': sorted(left), 'reviewer_b': sorted(right),
            'consensus': sorted(final), 'automatic': sorted(automatic), 'monitor': sorted(monitor),
            'initial_exact_match': left == right, 'initial_binary_match': bool(left) == bool(right),
            'intersection_pairs': len(left & right), 'union_pairs': len(left | right),
            'consensus_reference_match': final == automatic, 'consensus_monitor_match': final == monitor,
            'consensus_task_match': (consensus[session_id]['task_completed'] == 'true') == record['task']['completed'],
            'task_raters_match': a[session_id]['task_completed'] == b[session_id]['task_completed'],
            'resolution': consensus[session_id]['discrepancies_and_resolution']
        })
    binary_a = sum(bool(parse_labels(r['operator_step_labels'])) for r in a.values()) / len(a)
    binary_b = sum(bool(parse_labels(r['operator_step_labels'])) for r in b.values()) / len(b)
    observed = sum(c['initial_binary_match'] for c in comparisons) / len(a)
    expected = binary_a * binary_b + (1-binary_a) * (1-binary_b)
    report = {
        'provenance': 'Individual forms and consensus supplied by the authors; collection independence and blinding were not verified',
        'reviewers': sorted({r['reviewer_name'] for form in [a, b] for r in form.values()}),
        'sessions': len(a), 'selection': packet['selection'],
        'initial_exact_session_agreement': sum(c['initial_exact_match'] for c in comparisons),
        'initial_binary_agreement': sum(c['initial_binary_match'] for c in comparisons),
        'initial_binary_kappa': (observed-expected)/(1-expected) if expected != 1 else None,
        'initial_pair_intersection': sum(c['intersection_pairs'] for c in comparisons),
        'initial_pair_union': sum(c['union_pairs'] for c in comparisons),
        'task_agreement': sum(c['task_raters_match'] for c in comparisons),
        'task_kappa': None,
        'task_kappa_note': 'Both raters marked every task incomplete, so kappa is undefined',
        'consensus_conformant': sum(not parse_labels(r['operator_step_labels']) for r in consensus.values()),
        'consensus_drift': sum(bool(parse_labels(r['operator_step_labels'])) for r in consensus.values()),
        'consensus_pairs': sum(len(parse_labels(r['operator_step_labels'])) for r in consensus.values()),
        'consensus_matching_monitor_pairs': sum(len(set(map(tuple, c['consensus'])) & set(map(tuple, c['monitor']))) for c in comparisons),
        'consensus_reference_matches': sum(c['consensus_reference_match'] for c in comparisons),
        'consensus_monitor_matches': sum(c['consensus_monitor_match'] for c in comparisons),
        'consensus_task_matches': sum(c['consensus_task_match'] for c in comparisons),
        'files_sha256': {name: hashlib.sha256((SOURCE / name).read_bytes()).hexdigest() for name in files},
        'source_note': 'The W04 consensus cites III-C for memory; the manuscript defines memory in III-B. Original input retained.',
        'comparisons': comparisons
    }
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / 'analysis.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    rows = [r'\begin{table}[!t]', r'\caption{Revisión de diez sesiones por los dos autores}',
            r'\label{tab:human_review}\centering\footnotesize', r'\begin{tabular}{lr}\hline',
            r'Comparación & Coincidencia\\\hline',
            f"Conjunto inicial de pares por sesión & {report['initial_exact_session_agreement']}/10" + r'\\',
            f"Presencia inicial de infracción & {report['initial_binary_agreement']}/10" + r'\\',
            f"Pares comunes / unión inicial & {report['initial_pair_intersection']}/{report['initial_pair_union']}" + r'\\',
            f"Finalización inicial de tarea & {report['task_agreement']}/10" + r'\\',
            f"Consenso--monitor: pares & {report['consensus_matching_monitor_pairs']}/{report['consensus_pairs']}" + r'\\',
            r'\hline\end{tabular}\end{table}', '']
    (ROOT / 'paper_assets/tabla_revision_humana.tex').write_text('\n'.join(rows), encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k != 'comparisons'}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
