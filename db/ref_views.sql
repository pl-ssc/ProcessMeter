DROP VIEW IF EXISTS public.view_ref_process_full_structure;

CREATE VIEW public.view_ref_process_full_structure AS
SELECT
    p1.f1_name AS process_1_name,
    p2.f2_name AS process_2_name,
    p3.f3_name AS process_3_name,
    p4.f4_name AS process_4_name
FROM public.process_1 p1
JOIN public.process_2 p2 ON p2.process_1_id = p1.id
JOIN public.process_3 p3 ON p3.process_2_id = p2.id
JOIN public.process_4 p4 ON p4.process_3_id = p3.id
ORDER BY
    COALESCE(p1.sort, p1.id),
    p1.id,
    COALESCE(p2.sort, p2.id),
    p2.id,
    COALESCE(p3.sort, p3.id),
    p3.id,
    COALESCE(p4.sort, p4.id),
    p4.id;
