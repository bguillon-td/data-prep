package org.talend.dataprep.preparation;

import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.Assert.fail;
import static org.springframework.test.util.MatcherAssertionErrors.assertThat;
import static org.talend.dataprep.api.preparation.PreparationActions.ROOT_CONTENT;
import static org.talend.dataprep.api.preparation.Step.ROOT_STEP;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.output.NullOutputStream;
import org.hamcrest.MatcherAssert;
import org.hamcrest.core.Is;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.talend.dataprep.api.preparation.*;


@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = PreparationTest.class)
@Configuration
@ComponentScan(basePackages = "org.talend.dataprep")
@EnableAutoConfiguration
public class PreparationTest {

    @Autowired
    private PreparationRepository repository;

    @Test
    public void rootObjects() throws Exception {
        assertThat(repository.get("cdcd5c9a3a475f2298b5ee3f4258f8207ba10879", PreparationActions.class), notNullValue());
        assertThat(repository.get("cdcd5c9a3a475f2298b5ee3f4258f8207ba10879", Step.class), nullValue());
        assertThat(repository.get("f6e172c33bdacbc69bca9d32b2bd78174712a171", PreparationActions.class), nullValue());
        assertThat(repository.get("f6e172c33bdacbc69bca9d32b2bd78174712a171", Step.class), notNullValue());
    }

    @Test
    public void stepList() {
        final List<Action> actions = getSimpleAction("uppercase", "column_name", "lastname");
        final PreparationActions newContent1 = ROOT_CONTENT.append(actions);
        repository.add(newContent1);
        final PreparationActions newContent2 = newContent1.append(actions);
        repository.add(newContent2);
        // Steps
        final Step s1 = new Step(ROOT_STEP.id(), newContent1.id());
        repository.add(s1);
        final Step s2 = new Step(s1.id(), newContent2.id());
        repository.add(s2);
        // Preparation list tests
        List<String> strings = PreparationUtils.listSteps(s1, repository);
        assertThat(strings, hasItem(ROOT_STEP.getId()));
        assertThat(strings, hasItem(s1.getId()));
        assertThat(strings, not(hasItem(s2.getId())));

        strings = PreparationUtils.listSteps(s2, repository);
        assertThat(strings, hasItem(ROOT_STEP.getId()));
        assertThat(strings, hasItem(s1.getId()));
        assertThat(strings, hasItem(s2.getId()));
    }

    @Test
    public void stepListLimit() {
        final List<Action> actions = getSimpleAction("uppercase", "column_name", "lastname");
        final PreparationActions newContent1 = ROOT_CONTENT.append(actions);
        repository.add(newContent1);
        final PreparationActions newContent2 = newContent1.append(actions);
        repository.add(newContent2);
        // Steps
        final Step s1 = new Step(ROOT_STEP.id(), newContent1.id());
        repository.add(s1);
        final Step s2 = new Step(s1.id(), newContent2.id());
        repository.add(s2);
        // Preparation list tests
        List<String> strings = PreparationUtils.listSteps(s2, s1.getId(), repository);
        assertThat(strings, not(hasItem(ROOT_STEP.getId())));
        assertThat(strings, hasItem(s1.getId()));
        assertThat(strings, hasItem(s2.getId()));

        strings = PreparationUtils.listSteps(s2, s2.getId(), repository);
        assertThat(strings, not(hasItem(ROOT_STEP.getId())));
        assertThat(strings, not(hasItem(s1.getId())));
        assertThat(strings, hasItem(s2.getId()));
    }

    @Test
    public void nullArgs() throws Exception {
        assertThat(repository.get(null, Step.class), nullValue());
        assertThat(repository.get("cdcd5c9a3a475f2298b5ee3f4258f8207ba10879", null), notNullValue());
        Class<? extends Identifiable> objectClass = repository.get("cdcd5c9a3a475f2298b5ee3f4258f8207ba10879", null).getClass();
        assertThat(PreparationActions.class.isAssignableFrom(objectClass), Is.is(true));
        assertThat(repository.get(null, null), nullValue());
        Assert.assertThat(PreparationUtils.listSteps(null, repository), empty());
        try {
            PreparationUtils.listSteps(ROOT_STEP, null, repository);
            fail();
        } catch (IllegalArgumentException e) {
            // Expected
        }
    }

    @Test
    public void initialStep() {
        final List<Action> actions = getSimpleAction("uppercase", "column_name", "lastname");

        final PreparationActions newContent = new PreparationActions(actions);
        repository.add(newContent);

        final Step s = new Step(ROOT_STEP.id(), newContent.id());
        repository.add(s);

        Preparation preparation = new Preparation("1234", s);
        repository.add(preparation);

        MatcherAssert.assertThat(preparation.id(), Is.is("ae242b07084aa7b8341867a8be1707f4d52501d1"));
    }

    @Test
    public void initialStepWithAppend() {
        final List<Action> actions = getSimpleAction("uppercase", "column_name", "lastname");

        final PreparationActions newContent = ROOT_CONTENT.append(actions);
        repository.add(newContent);

        final Step s = new Step(ROOT_STEP.id(), newContent.id());
        repository.add(s);

        final Preparation preparation = new Preparation("1234", s);
        repository.add(preparation);

        MatcherAssert.assertThat(preparation.id(), Is.is("ae242b07084aa7b8341867a8be1707f4d52501d1"));
    }

    @Test
    public void stepsWithAppend() {
        final List<Action> actions = getSimpleAction("uppercase", "column_name", "lastname");

        final PreparationActions newContent1 = ROOT_CONTENT.append(actions);
        repository.add(newContent1);
        final PreparationActions newContent2 = newContent1.append(actions);
        repository.add(newContent2);

        // Steps
        final Step s1 = new Step(ROOT_STEP.id(), newContent1.id());
        repository.add(s1);

        final Step s2 = new Step(s1.id(), newContent2.id());
        repository.add(s2);

        // Preparation
        final Preparation preparation = new Preparation("1234", s2);
        repository.add(preparation);

        MatcherAssert.assertThat(preparation.id(), Is.is("ae242b07084aa7b8341867a8be1707f4d52501d1"));
    }

    @Test
    public void prettyPrint() throws Exception {
        final List<Action> actions = getSimpleAction("uppercase", "column_name", "lastname");
        final PreparationActions newContent = new PreparationActions(actions);
        repository.add(newContent);

        final Step s = new Step(ROOT_STEP.id(), newContent.id());
        repository.add(s);

        final Preparation preparation = new Preparation("1234", s);
        repository.add(preparation);

        PreparationUtils.prettyPrint(repository, preparation, new NullOutputStream()); // Basic walk through code, no
        // assert.
    }

    private static List<Action> getSimpleAction(final String actionName, final String paramKey, final String paramValue) {
        final Action action = new Action();
        action.setAction(actionName);
        action.getParameters().put(paramKey, paramValue);

        final List<Action> actions = new ArrayList<>();
        actions.add(action);

        return actions;
    }
}