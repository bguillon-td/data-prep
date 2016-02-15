package org.talend.dataprep.transformation.pipeline;

public class Main {

    public static final int AFFECT_WHOLE_ROW = 0x00001;

    public static final int AFFECT_COLUMN = 0x00010;

    public static final int METADATA_CHANGE_TYPE = 0x00100;

    public static final int VALUES_CHANGE   = 0x01000;

    public static void main(String[] args) {
        int b1 = AFFECT_COLUMN;
        int b2 = AFFECT_WHOLE_ROW;

        System.out.println(((b1 | b2) & AFFECT_COLUMN) != 0);
        System.out.println(((b1 | b2) & VALUES_CHANGE) != 0);
    }
}
