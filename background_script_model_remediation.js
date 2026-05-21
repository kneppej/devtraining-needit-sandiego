var incorrectModel = '686bca4d1bda0dd0ba6365f1604bcb90';
var correctModel = '44c8c0a4d1b524d9086a66311604bcba';
var correctManufacturer = '31a9532e3bb9ba90c83f24b693e45ac2';

// SAFETY SETTINGS
var recordLimit = 1; // Uncomment for testing

var deactivateIncorrectModel = false;
var updRecFields = false;


//==== QUERY HARDWARE ASSETS=====

var grAsset = new GlideRecord('alm_hardware');

grAsset.addEncodedQuery(
    'location.nameIN10625 FEDERAL DRIVE,1649 W FRANKFORD RD,375 RIVERSIDE PKWY,8375 DOMINION PKWY,1990 N STEMMONS FWY,2323 BRYAN ST,1203 MOBERLY LANE,805 SE MOBERLY LN.,6327 NE EVERGREEN PKWY,350 E CERMAK RD,1990 N STEMMONS FWY,44780 PERFORMANCE CIR,44740 PERFORMANCE CIR,21701 FILIGREE CT. BLDG D,50 NE 9TH ST,2001 6TH AVE,9 GREAT OAKS BLVD,183 BEAR HOLLOW RD,22271 BRODERICK DR,22271 SHELLHORN RD,6431 LONGHORN DR,4951 NE HUFFMAN ST,702 SW 8TH ST,9550 WESTOVER HILLS BLVD' +
    '^install_status!=7' +
    '^model_category!=6ae9b054c3031000b959fd251eba8fe1' +
    '^model_category!=73d479803713100044e0bfc8bcbe5d79' +
    '^model_category!=b7d5bc14c3031000b959fd251eba8fd0' +
    '^model_category!=218323293743100044e0bfc8bcbe5d61' +
    '^model_category!=e094ec0bdbc57784a0ae9af3db961904' +
    '^model_category!=b1eaf054c3031000b959fd251eba8fdc' +
    '^model_category!=b9eb7414c3031000b959fd251eba8fe5' +
    '^model_category!=5a0a80d81b39c99060678660604bcb3c' +
    '^model_category!=d5fd3854c3031000b959fd251eba8f28' +
    '^model_category!=dffe7854c3031000b959fd251eba8f2c' +
    '^model_category!=80ffb854c3031000b959fd251eba8f15' +
    '^model_category!=58e589e91b8dd85c6e6ceb17ec4bcbb0' +
    '^model_category!=57d5bc14c3031000b959fd251eba8fd7' +
    '^model.manufacturer!=b7e9e843c0a80169009a5a485bb2a2b5' +
    '^model_category!=3dfe3854c3031000b959fd251eba8f42' +
    '^model=' + incorrectModel
);

// FOR TESTING
grAsset.setLimit(recordLimit);

grAsset.query();

gs.print('===== STARTING HARDWARE MODEL REMEDIATION =====');

while (grAsset.next()) {

    gs.info('Processing Asset: ' + grAsset.asset_tag);

    //UPDATE RELATED CI FIRST

    if (grAsset.ci) {

        var grCI = new GlideRecord('cmdb_ci');

        if (grCI.get(grAsset.ci)) {

            gs.print('Updating CI: ' + grCI.getDisplayValue());

            grCI.model_id = correctModel;

            if (correctManufacturer) {
                grCI.manufacturer = correctManufacturer;
            }

            grCI.autoSysFields(updRecFields);
            grCI.update();
            gs.print('CI:  ' + grCI.model_id.getDisplayValue());

        } else {

            gs.print('CI not found for Asset: ' + grAsset.asset_tag);
        }
    }


    //UPDATE HARDWARE ASSET

    gs.print('Updating Asset Model: ' + grAsset.asset_tag);

    grAsset.model = correctModel;

    grAsset.autoSysFields(updRecFields);
    grAsset.update();
    gs.print('Asset:  ' + grAsset.model.getDisplayValue());
}


gs.print('===== ASSET/CI REMEDIATION COMPLETE =====');



//DEACTIVATE OLD MODEL

if (deactivateIncorrectModel) {

    var oldModel = new GlideRecord('cmdb_hardware_product_model');

    if (oldModel.get(incorrectModel)) {

        //oldModel.active = false;
        oldModel.name = 'DUPLICATE - ' + oldModel.name;

        oldModel.update();

        gs.print('Deactivated Duplicate Model: ' + oldModel.getDisplayValue());
    }
}

gs.print('===== SCRIPT COMPLETE =====');
