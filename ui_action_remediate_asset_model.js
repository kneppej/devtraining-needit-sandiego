// UI Action: Remediate Asset Model
// Table:     alm_hardware
// Condition: current.model == '686bca4d1bda0dd0ba6365f1604bcb90'
// Client:    false (server-side)
// Show on:   Form

(function () {

    var correctModel        = '44c8c0a4d1b524d9086a66311604bcba';
    var correctManufacturer = '31a9532e3bb9ba90c83f24b693e45ac2';

    // ── 1. UPDATE RELATED CI ──────────────────────────────────────────────────

    var ciSysId = current.getValue('ci');

    if (ciSysId) {

        var grCI = new GlideRecord('cmdb_ci');

        if (grCI.get(ciSysId)) {

            grCI.setValue('model_id', correctModel);
            grCI.setValue('manufacturer', correctManufacturer);
            grCI.update();
        }
    }

    // ── 2. FIND BASE/ROOT CATEGORY FROM CI MODEL_CATEGORY LIST ───────────────
    //
    // model_category is a list collector (glide_list) on cmdb_ci, stored as
    // comma-separated sys_ids. Walk each entry up the cmdb_model_category
    // hierarchy to find the root (a record whose parent field is empty).

    var baseCategory = '';

    if (ciSysId) {

        var grCICheck = new GlideRecord('cmdb_ci');

        if (grCICheck.get(ciSysId)) {

            var categoryList = grCICheck.getValue('model_category');

            if (categoryList) {

                var categoryIds = categoryList.split(',');

                for (var i = 0; i < categoryIds.length; i++) {

                    var catId = categoryIds[i].trim();

                    // Walk up the hierarchy to find the root for this entry
                    var grCat = new GlideRecord('cmdb_model_category');
                    while (grCat.get(catId) && grCat.getValue('parent')) {
                        catId = grCat.getValue('parent');
                    }

                    // grCat now holds the root category for this branch
                    if (grCat.isValidRecord()) {
                        baseCategory = grCat.getUniqueValue();
                        break; // first root found wins
                    }
                }
            }
        }
    }

    // ── 3. UPDATE ASSET ───────────────────────────────────────────────────────

    current.setValue('model', correctModel);

    if (baseCategory) {
        current.setValue('category', baseCategory);
    }

    current.update();

    // Reload the form to reflect updated field values
    action.setRedirectURL(current);

})();
