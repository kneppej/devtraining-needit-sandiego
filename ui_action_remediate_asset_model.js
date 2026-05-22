// UI Action: Remediate Asset Model
// Table:     alm_hardware
// Client:    false (server-side)
// Show on:   Form
//
// Condition (hide when category is already correctly set as main):
//   current.model_category.allow_as_master != true

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

    // ── 2. FIND MAIN CATEGORY FROM CI MODEL_CATEGORY LIST ────────────────────
    //
    // model_category on cmdb_ci is a list collector (glide_list) stored as
    // comma-separated sys_ids. The correct category for the asset is the one
    // in that list with allow_as_master = true. If none have the flag set,
    // fall back to the first entry.

    var mainCategory = '';

    if (ciSysId) {

        var grCICheck = new GlideRecord('cmdb_ci');

        if (grCICheck.get(ciSysId)) {

            var categoryList = grCICheck.getValue('model_category');

            if (categoryList) {

                var categoryIds = categoryList.split(',');
                var fallback    = '';

                for (var i = 0; i < categoryIds.length; i++) {

                    var catId = categoryIds[i].trim();
                    var grCat = new GlideRecord('cmdb_model_category');

                    if (grCat.get(catId)) {

                        if (grCat.getValue('allow_as_master') == '1') {
                            mainCategory = catId;
                            break;
                        }

                        if (!fallback) {
                            fallback = catId;
                        }
                    }
                }

                // Use fallback only if no category had allow_as_master set
                if (!mainCategory) {
                    mainCategory = fallback;
                }
            }
        }
    }

    // ── 3. UPDATE ASSET ───────────────────────────────────────────────────────

    current.setValue('model', correctModel);

    if (mainCategory) {
        current.setValue('model_category', mainCategory);
    }

    current.update();

    // Reload the form to reflect updated field values
    action.setRedirectURL(current);

})();
