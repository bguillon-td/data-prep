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
package org.talend.dataprep.user.store.inmemory;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.user.UserData;
import org.talend.dataprep.user.store.UserDataRepository;

/**
 * In Memory user data store implementation. It is mainly targeted for demo and tests.
 */
@Component
@ConditionalOnProperty(name = "user.data.store", havingValue = "in-memory", matchIfMissing = false)
public class InMemoryUserDataRepository implements UserDataRepository {

    /** Where user data is stored. */
    private final Map<String, UserData> store = new HashMap<>();

    /**
     * @see UserDataRepository#get(String)
     */
    @Override
    public UserData get(String userId) {
        return store.get(userId);
    }

    /**
     * @see UserDataRepository#save(UserData)
     */
    @Override
    public void save(UserData userData) {
        store.put(userData.getUserId(), userData);
    }

    /**
     * @see UserDataRepository#remove(String)
     */
    @Override
    public void remove(String userId) {
        store.remove(userId);
    }

    /**
     * @see UserDataRepository#clear()
     */
    @Override
    public void clear() {
        store.clear();
    }

}
