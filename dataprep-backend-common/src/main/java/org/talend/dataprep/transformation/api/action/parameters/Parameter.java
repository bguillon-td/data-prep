//  ============================================================================
//
//  Copyright (C) 2006-2016 Talend Inc. - www.talend.com
//
//  This source code is available under agreement available at
//  https://github.com/Talend/data-prep/blob/master/LICENSE
//
//  You should have received a copy of the agreement
//  along with this program; if not, write to Talend SA
//  9 rue Pages 92150 Suresnes, France
//
//  ============================================================================

package org.talend.dataprep.transformation.api.action.parameters;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.talend.dataprep.i18n.MessagesBundle;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Bean that models action parameter.
 */
public class Parameter implements Serializable {

    /** Serialization UID. */
    private static final long serialVersionUID = 1L;

    /** The parameter name. */
    private final String name;
    /** The parameter type. */
    private final String type;
    /** The parameter default value. */
    private final String defaultValue;
    /** True if the parameter is not displayed to the user. */
    private final boolean implicit;
    /** True if the parameter can be blank. */
    private final boolean canBeBlank;

    /** The configuration. */
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Map<String, Object> configuration;

    /**
     * Minimal default constructor.
     *
     * @param name The parameter name.
     * @param type The parameter type.
     */
    public Parameter(String name, ParameterType type) {
        this(name, type, null, false);
    }

    /**
     * Constructor with a default value.
     *
     * @param name The parameter name.
     * @param type The parameter type.
     * @param defaultValue the parameter default value.
     */
    public Parameter(String name, ParameterType type, String defaultValue) {
        this(name, type, defaultValue, false);
    }

    /**
     * Constructor with a default value and the implicit flag.
     *
     * @param name The parameter name.
     * @param type The parameter type.
     * @param defaultValue the parameter default value.
     * @param implicit true if the parameter is implicit.
     */
    public Parameter(final String name, final ParameterType type, final String defaultValue, final boolean implicit) {
        this(name, type, defaultValue, implicit, true);
    }

    /**
     * Full constructor.
     *
     * @param name The parameter name.
     * @param type The parameter type.
     * @param defaultValue the parameter default value.
     * @param implicit true if the parameter is implicit.
     * @param canBeBlank True if the parameter can be blank.
     */
    public Parameter(final String name, final ParameterType type, final String defaultValue, final boolean implicit,
            final boolean canBeBlank) {
        this.name = name;
        this.type = type.asString();
        this.defaultValue = defaultValue;
        this.implicit = implicit;
        this.canBeBlank = canBeBlank;
        this.configuration = new HashMap<>();
    }

    protected void addConfiguration(String name, Object configuration) {
        this.configuration.put(name, configuration);
    }

    /**
     * the unique identifier of the parameter
     */
    public String getName() {
        return name;
    }

    /**
     * the label of the parameter, translated in the user locale.
     */
    public String getLabel() {
        return MessagesBundle.getString("parameter." + getName() + ".label"); //$NON-NLS-1$ //$NON-NLS-2$
    }

    /**
     * the description of the parameter, translated in the user locale.
     */
    public String getDescription() {
        return MessagesBundle.getString("parameter." + getName() + ".desc"); //$NON-NLS-1$ //$NON-NLS-2$
    }

    /**
     * the type of the parameter
     */
    public String getType() {
        return type;
    }

    /**
     * the parameter's default value
     */
    public String getDefault() {
        return defaultValue;
    }

    /**
     * indicates if the parameter is implicit (not to ask to user directly)
     */
    public boolean isImplicit() {
        return implicit;
    }

    /**
     * indicates if the parameter value can be blank
     */
    public boolean isCanBeBlank() {
        return canBeBlank;
    }

    /**
     * @return the parameter configuration
     */
    public Map<String, Object> getConfiguration() {
        return configuration;
    }
}
