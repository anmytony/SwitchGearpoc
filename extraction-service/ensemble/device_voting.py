from __future__ import annotations

from collections import defaultdict
from typing import Iterable

from models.response import CubicleDeviceResult


def _norm(value: str | None) -> str:
    return (value or "").strip()


def _group_key(device: CubicleDeviceResult) -> tuple[int, str, str, int]:
    functional = _norm(device.functional_position)
    panel = _norm(device.panel_type)
    # Prefer functional position. Fall back to panel+page for rows without position.
    return (
        int(device.instance_index or 1),
        functional.lower(),
        panel.lower(),
        int(device.source_page or 0),
    )


def _winner_for_field(
    rows: list[CubicleDeviceResult],
    field_name: str,
) -> tuple[str, str, float, list[str]]:
    winner_value = ""
    winner_source = ""
    winner_conf = -1.0
    disagreements: list[str] = []

    for row in rows:
        value = _norm(getattr(row, field_name, ""))
        if not value:
            continue
        conf = float(row.confidence or 0.0)
        if conf > winner_conf:
            if winner_value and winner_value.lower() != value.lower():
                disagreements.append(f"{field_name}: {winner_value} vs {value}")
            winner_value = value
            winner_source = row.extraction_path
            winner_conf = conf
        elif conf == winner_conf and winner_value and winner_value.lower() != value.lower():
            disagreements.append(f"{field_name}: {winner_value} vs {value}")

    return winner_value, winner_source, max(winner_conf, 0.0), disagreements


def vote_devices(
    path_b: Iterable[CubicleDeviceResult],
    path_c: Iterable[CubicleDeviceResult],
    low_confidence_threshold: float = 0.75,
) -> list[CubicleDeviceResult]:
    grouped: dict[tuple[int, str, str, int], list[CubicleDeviceResult]] = defaultdict(list)
    for d in path_b:
        grouped[_group_key(d)].append(d)
    for d in path_c:
        grouped[_group_key(d)].append(d)

    merged: list[CubicleDeviceResult] = []

    for key in sorted(grouped.keys()):
        rows = grouped[key]

        functional_position = next((r.functional_position for r in rows if _norm(r.functional_position)), "")
        panel_type = next((r.panel_type for r in rows if _norm(r.panel_type)), "")
        source_page = next((r.source_page for r in rows if r.source_page), 0)
        instance_index = key[0]

        cb_model,              _, cb_conf,        cb_notes        = _winner_for_field(rows, "cb_model")
        cb_rating,             _, cb_rating_conf,  cb_rating_notes = _winner_for_field(rows, "cb_rating")
        cb_breaking_capacity,  _, cb_break_conf,   cb_break_notes  = _winner_for_field(rows, "cb_breaking_capacity")
        cb_making_capacity,    _, cb_make_conf,    cb_make_notes   = _winner_for_field(rows, "cb_making_capacity")
        cb_mechanism_type,     _, cb_mech_conf,    cb_mech_notes   = _winner_for_field(rows, "cb_mechanism_type")
        cb_number_of_poles,    _, cb_poles_conf,   cb_poles_notes  = _winner_for_field(rows, "cb_number_of_poles")
        ct_ratio,              _, ct_conf,          ct_notes        = _winner_for_field(rows, "ct_ratio")
        ct_accuracy_class,     _, ct_acc_conf,      ct_acc_notes    = _winner_for_field(rows, "ct_accuracy_class")
        ct_burden,             _, ct_burd_conf,    ct_burd_notes   = _winner_for_field(rows, "ct_burden")
        ct_core_type,          _, ct_core_conf,    ct_core_notes   = _winner_for_field(rows, "ct_core_type")
        vt_ratio,              _, vt_conf,          vt_notes        = _winner_for_field(rows, "vt_ratio")
        vt_accuracy_class,     _, vt_acc_conf,      vt_acc_notes    = _winner_for_field(rows, "vt_accuracy_class")
        vt_burden,             _, vt_burd_conf,    vt_burd_notes   = _winner_for_field(rows, "vt_burden")
        vt_insulation_level,   _, vt_insul_conf,   vt_insul_notes  = _winner_for_field(rows, "vt_insulation_level")
        relay_model,           _, relay_conf,       relay_notes     = _winner_for_field(rows, "relay_model")
        relay_aux_voltage,     _, relay_aux_conf,  relay_aux_notes = _winner_for_field(rows, "relay_aux_voltage")
        ds_count,              _, ds_cnt_conf,     ds_cnt_notes    = _winner_for_field(rows, "ds_count")
        ds_operating_mode,     _, ds_mode_conf,    ds_mode_notes   = _winner_for_field(rows, "ds_operating_mode")
        es_present,            _, es_pres_conf,    es_pres_notes   = _winner_for_field(rows, "es_present")
        es_id,                 _, es_id_conf,      es_id_notes     = _winner_for_field(rows, "es_id")
        sa_present,            _, sa_pres_conf,    sa_pres_notes   = _winner_for_field(rows, "sa_present")
        aux_control_voltage,   _, aux_volt_conf,   aux_volt_notes  = _winner_for_field(rows, "aux_control_voltage")

        # List fields — pick highest-confidence row that has a non-empty list
        def _best_list(field: str) -> tuple[list[str], float, str]:
            candidates = [
                (getattr(r, field, []), float(r.confidence or 0.0), r.extraction_path)
                for r in rows if getattr(r, field, [])
            ]
            if not candidates:
                return [], 0.0, ""
            candidates.sort(key=lambda x: x[1], reverse=True)
            return candidates[0]

        protection_functions, protection_conf, _ = _best_list("protection_functions")
        relay_comm_protocol,  comm_conf,        _ = _best_list("relay_comm_protocol")

        overall_confidence = max(
            cb_conf, cb_rating_conf, cb_break_conf, cb_make_conf,
            ct_conf, ct_acc_conf, vt_conf, vt_acc_conf,
            relay_conf, protection_conf, 0.0,
        )

        disagreements = (
            cb_notes + cb_rating_notes + cb_break_notes + cb_make_notes
            + cb_mech_notes + cb_poles_notes
            + ct_notes + ct_acc_notes + ct_burd_notes + ct_core_notes
            + vt_notes + vt_acc_notes + vt_burd_notes + vt_insul_notes
            + relay_notes + relay_aux_notes
            + ds_cnt_notes + ds_mode_notes
            + es_pres_notes + es_id_notes + sa_pres_notes + aux_volt_notes
        )

        sources = sorted({(r.extraction_path or "").strip() for r in rows if (r.extraction_path or "").strip()})
        extraction_path = "+".join(sources) if sources else ""

        merged.append(
            CubicleDeviceResult(
                functional_position=functional_position,
                panel_type=panel_type,
                cb_model=cb_model,
                cb_rating=cb_rating,
                cb_breaking_capacity=cb_breaking_capacity,
                cb_making_capacity=cb_making_capacity,
                cb_mechanism_type=cb_mechanism_type,
                cb_number_of_poles=cb_number_of_poles,
                ct_ratio=ct_ratio,
                ct_accuracy_class=ct_accuracy_class,
                ct_burden=ct_burden,
                ct_core_type=ct_core_type,
                vt_ratio=vt_ratio,
                vt_accuracy_class=vt_accuracy_class,
                vt_burden=vt_burden,
                vt_insulation_level=vt_insulation_level,
                relay_model=relay_model,
                protection_functions=protection_functions,
                relay_aux_voltage=relay_aux_voltage,
                relay_comm_protocol=relay_comm_protocol,
                ds_count=ds_count,
                ds_operating_mode=ds_operating_mode,
                es_present=es_present,
                es_id=es_id,
                sa_present=sa_present,
                aux_control_voltage=aux_control_voltage,
                confidence=overall_confidence,
                extraction_path=extraction_path,
                source_page=source_page,
                instance_index=instance_index,
                flagged_for_review=overall_confidence < low_confidence_threshold or len(disagreements) > 0,
                deviation_reason="; ".join(disagreements),
            )
        )

    return merged
